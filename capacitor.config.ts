import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.arkaserve.prep',
  appName: 'MockTest',
  webDir: 'dist',

  plugins: {
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

  android: {
    // Allow HTTP in debug builds only — production uses HTTPS exclusively.
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
