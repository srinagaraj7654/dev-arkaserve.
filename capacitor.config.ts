import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.arkaserve.prep',
  appName: 'MockTest',
  webDir: 'dist',

  // Bundled build — the app loads from the dist/ folder, not a live server.
  // For local dev against the running Vite server, temporarily set:
  //   server: { url: 'http://YOUR_LAN_IP:3000', cleartext: true }
  // but never commit that to source control.

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
    webContentsDebuggingEnabled: false, // set true only for dev builds
  },

  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    limitsNavigationsToAppBoundDomains: true,
  },
}

export default config
