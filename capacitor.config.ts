import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gcufportal',
  appName: 'GCUF LF Portal',
  webDir: 'public',
    server: {
    url: 'https://gcuf-lf-portal.vercel.app/',
    cleartext: true
  }
};

export default config;
