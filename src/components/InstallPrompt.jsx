import { useState, useEffect } from 'react'

// Detect iOS Safari in standalone PWA mode
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const isInStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showIOS, setShowIOS] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed')) return

    // Android / Chrome: standard beforeinstallprompt flow
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari: show manual "Add to Home Screen" instructions
    // only in browser mode (not if already installed as PWA)
    if (isIOS() && !isInStandaloneMode()) {
      // Delay slightly so it doesn't flash on first load
      const t = setTimeout(() => setShowIOS(true), 2500)
      return () => { clearTimeout(t); window.removeEventListener('beforeinstallprompt', handler) }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setDismissed(true)
    setVisible(false)
    setShowIOS(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDismissed(true)
  }

  // Android banner
  if (visible && !dismissed) {
    return (
      <div
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50
                   bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex items-start gap-3"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: '#FF653F' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">Install MockTest</p>
          <p className="text-xs text-gray-500 mt-0.5">Add to home screen for faster access offline.</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={install}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-white"
              style={{ background: '#FF653F' }}
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            >
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 -mt-0.5 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    )
  }

  // iOS Safari banner — manual "Add to Home Screen" instructions
  if (showIOS && !dismissed) {
    return (
      <div
        className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: '#FF653F' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900">Install MockTest</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Tap the <strong>Share</strong> button{' '}
              <svg
                className="inline-block w-3.5 h-3.5 mb-0.5"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {' '}then <strong>Add to Home Screen</strong> for offline access.
            </p>
          </div>
          <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 -mt-0.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Arrow pointing down toward the share button on iPhone */}
        <div className="flex justify-center mt-2">
          <svg className="w-5 h-5 text-orange-400 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    )
  }

  return null
}
