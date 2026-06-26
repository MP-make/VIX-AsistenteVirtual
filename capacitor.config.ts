import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vix.intelligentassistant',
  appName: 'VIX',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
