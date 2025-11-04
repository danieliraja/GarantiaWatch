import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

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
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'warranty-images'
  },
  plugins: ['expo-notifications']
};

export default config;
