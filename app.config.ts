import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [
    !supabaseUrl ? 'SUPABASE_URL' : null,
    !supabaseAnonKey ? 'SUPABASE_ANON_KEY' : null
  ]
    .filter((value): value is string => value !== null)
    .join(', ');

  throw new Error(
    `Missing required environment variable(s) for Supabase configuration: ${missingVars}`
  );
}

const config: ExpoConfig = {
  name: 'GarantiaWatch',
  slug: 'garantiawatch',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true
  },
  android: {},
  web: {
    bundler: 'metro',
    output: 'single'
  },
  extra: {
    supabaseUrl,
    supabaseAnonKey,
    supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'warranty-images'
  },
  plugins: ['expo-notifications']
};

export default config;
