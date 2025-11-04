import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const expoConfig = Constants.expoConfig ?? Constants.manifest;
const extra = expoConfig?.extra as Record<string, string | undefined> | undefined;

const supabaseUrl = extra?.supabaseUrl;
const supabaseAnonKey = extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please configure SUPABASE_URL and SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export const STORAGE_BUCKET = (extra?.supabaseStorageBucket ?? 'warranty-images') as string;
