import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.matinee.app',
  appName: 'Matinee',
  webDir: 'www',
  server: {
    url: 'https://matinee-two.vercel.app/',
    cleartext: false,
  },
  androidScheme: 'https',
};

export default config;
