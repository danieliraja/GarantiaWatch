import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { PostgrestError } from '@supabase/supabase-js';
import { STORAGE_BUCKET, supabase } from '../config/supabase';
import { useAuth } from './AuthContext';
import { Warranty, WarrantyInput, WarrantyStatus } from '../types/warranty';
import { calculateDueDate, determineStatus } from '../utils/date';

interface WarrantyContextValue {
  warranties: Warranty[];
  loading: boolean;
  error: PostgrestError | null;
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

const uploadImage = async (imageUri: string, userId: string): Promise<string | undefined> => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const extension = imageUri.split('.').pop() ?? 'jpg';
    const path = `${userId}/${Date.now()}.${extension}`;

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
    return undefined;
  }
};

export const WarrantyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<PostgrestError | null>(null);
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
      return;
    }

    const channel = supabase
      .channel('warranties-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'warranties', filter: `user_id=eq.${user.id}` },
        () => {
          fetchWarranties();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWarranties, user]);

  const createWarranty = useCallback(
    async (input: WarrantyInput) => {
      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      setLoading(true);
      setError(null);

      const dueDate = calculateDueDate(input.exchange_date, input.warranty_days);
      let imageUrl: string | undefined;
      if (input.image_uri) {
        imageUrl = await uploadImage(input.image_uri, user.id);
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
        setLoading(false);
        return;
      }

      const created = data as Warranty;
      const notificationId = await scheduleExpirationNotification(created);
      if (notificationId) {
        await supabase
          .from('warranties')
          .update({ notification_id: notificationId })
          .eq('id', created.id);
      }

      setWarranties((prev) => [...prev, { ...created, notification_id: notificationId ?? undefined }]);
      setLoading(false);
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
    () => ({ warranties, loading, error, statusFilter, setStatusFilter, filteredWarranties, createWarranty, refresh }),
    [warranties, loading, error, statusFilter, filteredWarranties, createWarranty, refresh]
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

