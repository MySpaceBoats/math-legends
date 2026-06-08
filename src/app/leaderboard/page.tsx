'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface LeaderboardEntry {
  id: string
  pseudo: string
  firstName: string
  level: number
  xp: number
  elo: number
  rank: number
  avatarUrl?: string
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'global' | 'weekly' | 'monthly'>('global')
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; pseudo: string } | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('mathlegendsUser')
    if (u) setUser(JSON.parse(u))
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/leaderboard?type=${tab}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
  }, [tab])

  const medalEmojis = ['🥇', '🥈', '🥉']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push(user ? '/play' : '/')}
            className="text-2xl font-black text-white"
          >
            ⚡ MATH LEGENDS
          </button>
          <div className="flex gap-3">
            {user && (
              <button
                onClick={() => router.push('/play')}
                className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-4 py-2 text-sm transition-all"
              >
                Play
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="bg-purple-700 hover:bg-purple-600 text-white rounded-xl px-4 py-2 text-sm transition-all"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-4xl font-black text-white mb-2">🏆 Leaderboard</h1>
        <p className="text-slate-400 mb-8">The world&apos;s top Math Legends</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['global', 'weekly', 'monthly'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all capitalize ${tab === t ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              {t === 'global' ? '🌍 Global' : t === 'weekly' ? '📅 Weekly' : '📆 Monthly'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-20">Loading rankings...</div>
        ) : (
          <div className="space-y-3">
            {data.map((entry) => {
              const isCurrentUser = user?.id === entry.id
              return (
                <div
                  key={entry.id}
                  onClick={() => router.push(`/player/${entry.pseudo}`)}
                  className={`flex items-center gap-4 rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] ${isCurrentUser ? 'bg-purple-900/50 border border-purple-500/50' : 'bg-slate-800/80 hover:bg-slate-700/80'}`}
                >
                  <div
                    className={`w-10 text-center font-black text-xl ${entry.rank <= 3 ? 'text-yellow-400' : 'text-slate-500'}`}
                  >
                    {entry.rank <= 3 ? medalEmojis[entry.rank - 1] : `#${entry.rank}`}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {entry.pseudo.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-bold">
                      {entry.pseudo}{' '}
                      {isCurrentUser && (
                        <span className="text-xs text-purple-400">(you)</span>
                      )}
                    </p>
                    <p className="text-slate-400 text-sm">Level {entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-bold">{entry.xp.toLocaleString()} XP</p>
                    <p className="text-yellow-400 text-sm">⚡ {entry.elo} Elo</p>
                  </div>
                </div>
              )
            })}
            {data.length === 0 && (
              <div className="text-center text-slate-500 py-20">
                No players yet. Be the first!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
