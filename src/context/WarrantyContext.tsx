import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Crypto from 'expo-crypto';
import { PostgrestError } from '@supabase/supabase-js';
import { STORAGE_BUCKET, supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import { Warranty, WarrantyInput, WarrantyStatus } from '../types/warranty';
import { calculateDueDate, determineStatus } from '../utils/date';

type RealtimeConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'SUBSCRIBING'
  | 'SUBSCRIBED'
  | 'TIMED_OUT'
  | 'CHANNEL_ERROR'
  | 'CLOSED';

interface WarrantyContextValue {
  warranties: Warranty[];
  loading: boolean;
  error: PostgrestError | null;
  realtimeStatus: RealtimeConnectionStatus;
  realtimeError: string | null;
  statusFilter: WarrantyStatus | 'todas';
  setStatusFilter: (status: WarrantyStatus | 'todas') => void;
  filteredWarranties: Warranty[];
  createWarranty: (input: WarrantyInput) => Promise<void>;
  refresh: () => Promise<void>;
}

const WarrantyContext = createContext<WarrantyContextValue | undefined>(undefined);

const scheduleExpirationNotification = async (warranty: Warranty): Promise<string | null> => {
  const dueDate = new Date(warranty.due_date);
  const triggerDate = new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000);

  if (triggerDate <= new Date()) {
    console.warn(
      'Skipping notification scheduling for past trigger date',
      {
        warrantyId: warranty.id,
        dueDate: warranty.due_date,
        triggerDate: triggerDate.toISOString()
      }
    );
    return null;
  }

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Garantia prestes a vencer',
      body: `${warranty.client_name} vence em ${dueDate.toLocaleDateString('pt-BR')}`,
      data: { warrantyId: warranty.id }
    },
    trigger: triggerDate
  });

  return identifier;
};

const uploadImage = async (imageUri: string, userId: string): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    let response: Response;
    try {
      response = await fetch(imageUri, { signal: controller.signal });
    } catch (fetchError) {
      const error = fetchError as Error;
      if (error && error.name === 'AbortError') {
        throw new Error('Tempo esgotado ao carregar a imagem da garantia. Tente novamente.');
      }
      throw fetchError;
    } finally {
      clearTimeout(timeoutId);
    }

    const blob = await response.blob();
    const extension = imageUri.split('.').pop() ?? 'jpg';
    const uniqueId = Crypto.randomUUID();
    const path = `${userId}/${uniqueId}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (error) {
    console.error('Image upload failed', error);
    throw error instanceof Error
      ? error
      : new Error('Falha ao enviar imagem da garantia. Tente novamente.');
  }
};

export const WarrantyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeConnectionStatus>('idle');
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | 'todas'>('todas');

  const fetchWarranties = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('warranties')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    setWarranties((data ?? []) as Warranty[]);
    setError(null);
    setLoading(false);
  }, [user]);

  const refresh = useCallback(async () => {
    await fetchWarranties();
  }, [fetchWarranties]);

  useEffect(() => {
    fetchWarranties();
  }, [fetchWarranties]);

  useEffect(() => {
    if (!user) {
      setRealtimeStatus('idle');
      setRealtimeError(null);
      return;
    }

    setRealtimeStatus('connecting');
    setRealtimeError(null);

    let isActive = true;

    const channel = supabase
      .channel('warranties-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'warranties', filter: `user_id=eq.${user.id}` },
        () => {
          fetchWarranties();
        }
      )
      .on('system', { event: 'SUBSCRIPTION_ERROR' }, (payload) => {
        if (!isActive) {
          return;
        }

        console.error('Realtime subscription system error', payload);
        setRealtimeStatus('CHANNEL_ERROR');
        const message =
          payload && typeof payload === 'object' && 'message' in payload
            ? String((payload as { message?: string }).message)
            : 'Erro na conexão com atualizações em tempo real.';
        setRealtimeError(message);
      })
      .on('system', { event: 'SUBSCRIPTION_STATUS' }, (payload) => {
        if (!isActive) {
          return;
        }

        if (!payload || typeof payload !== 'object') {
          return;
        }

        const nextStatusRaw = (payload as { status?: string }).status;
        if (!nextStatusRaw) {
          return;
        }

        const nextStatus = nextStatusRaw as RealtimeConnectionStatus;
        setRealtimeStatus(nextStatus);

        if (nextStatus === 'SUBSCRIBED') {
          setRealtimeError(null);
        }
      });

    const removeChannel = () => {
      supabase.removeChannel(channel);
    };

    const handleSubscriptionStatus = (status: RealtimeConnectionStatus, err?: unknown) => {
      if (!isActive) {
        return;
      }

        if (status === 'SUBSCRIBED') {
          setRealtimeStatus(status);
          setRealtimeError(null);
          return;
        }

        if (status === 'SUBSCRIBING') {
          setRealtimeStatus(status);
          return;
        }

        if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error', err);
          setRealtimeStatus(status);
          const message = err instanceof Error ? err.message : 'Erro na conexão com atualizações em tempo real.';
          setRealtimeError(message);
          return;
        }

        if (status === 'TIMED_OUT') {
          console.warn('Realtime subscription timed out', err);
          setRealtimeStatus(status);
          setRealtimeError('A conexão com as atualizações expirou. Puxe para atualizar.');
          return;
        }

        if (status === 'CLOSED') {
          setRealtimeStatus(status);
          setRealtimeError(null);
          return;
        }

        setRealtimeStatus(status);
        setRealtimeError(null);
      });
    };

    const subscribeToChannel = async () => {
      try {
        setRealtimeStatus('SUBSCRIBING');
        await channel.subscribe((status, err) => {
          handleSubscriptionStatus(status as RealtimeConnectionStatus, err);
        });
      } catch (subscribeError) {
        if (!isActive) {
          return;
        }

        console.error('Failed to subscribe to warranty updates', subscribeError);
        setRealtimeStatus('CHANNEL_ERROR');
        setRealtimeError(
          subscribeError instanceof Error
            ? subscribeError.message
            : 'Erro ao iniciar a conexão com atualizações em tempo real.'
        );
        removeChannel();
      }
    };

    subscribeToChannel();

    return () => {
      isActive = false;
      setRealtimeStatus('idle');
      setRealtimeError(null);
      removeChannel();
    };
  }, [fetchWarranties, user]);

  const createWarranty = useCallback(
    async (input: WarrantyInput) => {
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      setLoading(true);
      setError(null);

      try {
        const dueDate = calculateDueDate(input.exchange_date, input.warranty_days);
        let imageUrl: string | undefined;
        if (input.image_uri) {
          try {
            imageUrl = await uploadImage(input.image_uri, user.id);
          } catch (uploadError) {
            console.error('Failed to upload warranty image', uploadError);
            throw uploadError instanceof Error
              ? uploadError
              : new Error('Falha ao enviar imagem da garantia. Tente novamente.');
          }
        }

        const { data, error: insertError } = await supabase
          .from('warranties')
          .insert({
            user_id: user.id,
            client_name: input.client_name,
            client_phone: input.client_phone,
            exchange_date: input.exchange_date,
            warranty_days: input.warranty_days,
            due_date: dueDate,
            notes: input.notes,
            image_url: imageUrl
          })
          .select()
          .single();

        if (insertError) {
          setError(insertError);
          throw new Error(insertError.message);
        }

        const created = data as Warranty;
        let finalWarranty: Warranty = created;

        const notificationId = await scheduleExpirationNotification(created);
        if (notificationId) {
          const { data: updatedData, error: updateError } = await supabase
            .from('warranties')
            .update({ notification_id: notificationId })
            .eq('id', created.id)
            .select()
            .single();

          if (updateError) {
            console.error('Failed to persist notification identifier for warranty', updateError);
            setError(updateError);
            throw new Error(updateError.message);
          }

          finalWarranty = (updatedData as Warranty) ?? { ...created, notification_id: notificationId };
        }

        setWarranties((prev) => [...prev, finalWarranty]);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const filteredWarranties = useMemo(() => {
    if (statusFilter === 'todas') {
      return warranties;
    }
    return warranties.filter((warranty) => determineStatus(warranty) === statusFilter);
  }, [statusFilter, warranties]);

  const value = useMemo(
    () => ({
      warranties,
      loading,
      error,
      realtimeStatus,
      realtimeError,
      statusFilter,
      setStatusFilter,
      filteredWarranties,
      createWarranty,
      refresh
    }),
    [
      warranties,
      loading,
      error,
      realtimeStatus,
      realtimeError,
      statusFilter,
      filteredWarranties,
      createWarranty,
      refresh
    ]
  );

  return <WarrantyContext.Provider value={value}>{children}</WarrantyContext.Provider>;
};

export const useWarranties = (): WarrantyContextValue => {
  const context = useContext(WarrantyContext);
  if (!context) {
    throw new Error('useWarranties must be used inside WarrantyProvider');
  }
  return context;
};

