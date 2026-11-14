import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.arkaserve.prep',
  appName: 'MockTest',
  webDir: 'dist',

  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_notify',
      iconColor: '#E85A2C',
      sound: undefined,
    },
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0f172a',   // navy — matches Navbar background
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true,
    },
    StatusBar: {
      style: 'DARK',                 // white icons on dark background
      backgroundColor: '#0f172a',
      overlaysWebView: false,
    },
  },

  // Sets the WebView's virtual hostname so API requests carry Origin: https://prep.arkaserve.com,
  // matching the backend's CORS allowlist (https://localhost is rejected by the backend).
  server: {
    hostname: 'prep.arkaserve.com',
  },

  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },

  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
  },
}

export default config
