'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [mode, setMode] = useState<'landing' | 'register' | 'login'>('landing')
  const [firstName, setFirstName] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, pseudo }),
      })
      const text = await res.text()
      let data: { error?: string; user?: unknown }
      try { data = JSON.parse(text) } catch { data = { error: `Server error (${res.status}): ${text.slice(0, 200)}` } }
      if (!res.ok) {
        setError(data.error ?? 'Unknown error')
        return
      }
      localStorage.setItem('mathlegendsUser', JSON.stringify(data.user))
      router.push('/play')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pseudo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error)
        return
      }
      localStorage.setItem('mathlegendsUser', JSON.stringify(data.user))
      router.push('/play')
    } catch {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-black text-white mb-4">⚡ MATH LEGENDS</h1>
        <p className="text-xl text-purple-300">The competitive math arena</p>
        <div className="flex gap-4 mt-6 justify-center text-sm text-purple-400 flex-wrap">
          <span>🏆 Global Rankings</span>
          <span>📊 Elo System</span>
          <span>🎖️ Badges</span>
          <span>🌍 5 Worlds</span>
        </div>
      </div>

      {mode === 'landing' && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => setMode('register')}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all hover:scale-105 shadow-lg"
          >
            Start Adventure
          </button>
          <button
            onClick={() => setMode('login')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all"
          >
            Continue
          </button>
          <button
            onClick={() => router.push('/leaderboard')}
            className="w-full border border-purple-500/50 text-purple-300 hover:bg-purple-900/30 font-bold py-3 px-8 rounded-xl transition-all"
          >
            View Rankings
          </button>
        </div>
      )}

      {mode === 'register' && (
        <form
          onSubmit={handleRegister}
          className="w-full max-w-sm bg-slate-800/80 backdrop-blur rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Create Legend</h2>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex flex-col gap-4">
            <input
              className="bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              className="bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none"
              placeholder="Choose your Legend name"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
            >
              {loading ? 'Creating...' : 'Become a Legend'}
            </button>
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="text-slate-400 text-sm hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </form>
      )}

      {mode === 'login' && (
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-slate-800/80 backdrop-blur rounded-2xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex flex-col gap-4">
            <input
              className="bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:border-purple-500 focus:outline-none"
              placeholder="Your Legend name"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
            >
              {loading ? 'Loading...' : 'Enter the Arena'}
            </button>
            <button
              type="button"
              onClick={() => setMode('landing')}
              className="text-slate-400 text-sm hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
