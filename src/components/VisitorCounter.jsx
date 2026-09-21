import { useState, useEffect } from 'react'
import api from '../api'

function formatCount(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K+'
  return n.toString()
}

export default function VisitorCounter() {
  const [count, setCount] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    api.get('/visitor/count')
      .then(r => {
        const n = r.data?.count ?? r.data?.total ?? 0
        setCount(n)
        setLoaded(true)
      })
      .catch(() => setLoaded(true)) // show widget even if API fails
  }, [])

  // Refresh every 30s for live feel
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true)
      setTimeout(() => setPulse(false), 600)
      api.get('/visitor/count')
        .then(r => setCount(r.data?.count ?? r.data?.total ?? count))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(id)
  }, [count])

  if (!loaded) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: '10px 20px',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 40,
      width: 'fit-content',
      margin: '0 auto',
    }}>
      {/* Live dot */}
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: '#22c55e',
        display: 'block',
        flexShrink: 0,
        boxShadow: pulse ? '0 0 0 4px rgba(34,197,94,0.3)' : '0 0 0 0px rgba(34,197,94,0)',
        transition: 'box-shadow 0.4s ease',
      }} />
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
        <span style={{
          fontSize: 15,
          fontWeight: 800,
          color: '#fff',
          marginRight: 4,
          fontVariantNumeric: 'tabular-nums',
        }}>{count > 0 ? formatCount(count) : 'Be the first!'}</span>
        {count > 0 ? 'students have practiced on MockTest' : 'Start your free mock test today'}
      </span>
    </div>
  )
}
