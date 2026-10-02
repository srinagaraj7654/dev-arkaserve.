import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed')) return
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || dismissed) return null

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
    setDismissed(true)
  }

  const dismiss = () => {
    setDismissed(true)
    setVisible(false)
    localStorage.setItem('pwa-install-dismissed', '1')
  }

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
        <span className="text-white text-lg">📱</span>
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
