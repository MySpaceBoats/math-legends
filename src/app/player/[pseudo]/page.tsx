'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition: string
}

interface UserBadge {
  id: string
  badge: Badge
  earnedAt: string
}

interface QuizAttempt {
  id: string
  correctAnswers: number
  totalQuestions: number
  xpEarned: number
  eloChange: number
  completedAt: string
  quiz?: {
    title: string
    level?: { world?: { name: string } }
  }
}

interface EloHistoryEntry {
  id: string
  change: number
  newRating: number
  reason: string
  createdAt: string
}

interface Player {
  pseudo: string
  firstName: string
  level: number
  xp: number
  eloRating: number
  successRate: number
  totalQuizzes: number
  userBadges: UserBadge[]
  quizAttempts: QuizAttempt[]
  eloHistory: EloHistoryEntry[]
  error?: string
}

export default function PlayerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<Player | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ pseudo: string } | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('mathlegendsUser')
    if (u) setCurrentUser(JSON.parse(u))
    fetch(`/api/player/${params.pseudo}`)
      .then((r) => r.json())
      .then((d) => {
        setPlayer(d)
        setLoading(false)
      })
  }, [params.pseudo])

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading profile...</div>
      </div>
    )
  if (!player || player.error)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Player not found</div>
      </div>
    )

  const isOwnProfile = currentUser?.pseudo === params.pseudo

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push(currentUser ? '/play' : '/')}
            className="text-2xl font-black text-white"
          >
            ⚡ MATH LEGENDS
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/leaderboard')}
              className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-4 py-2 text-sm transition-all"
            >
              🏆 Rankings
            </button>
            {currentUser && (
              <button
                onClick={() => router.push('/play')}
                className="bg-purple-700 hover:bg-purple-600 text-white rounded-xl px-4 py-2 text-sm transition-all"
              >
                Play
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        {/* Profile Hero */}
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-800/50 rounded-3xl p-8 mb-8">
          <div className="flex items-start gap-6 flex-wrap">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-4xl font-black text-white">
              {player.pseudo.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-black text-white">{player.pseudo}</h1>
                {isOwnProfile && (
                  <span className="bg-purple-600/40 text-purple-300 text-xs px-3 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
              <p className="text-slate-400">{player.firstName}</p>
              <div className="flex items-center gap-6 mt-4 flex-wrap">
                <div>
                  <p className="text-3xl font-black text-purple-400">{player.level}</p>
                  <p className="text-xs text-slate-500">Level</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-yellow-400">{player.eloRating}</p>
                  <p className="text-xs text-slate-500">Elo Rating</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-green-400">
                    {player.xp.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">Total XP</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-400">
                    {player.successRate?.toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">Success Rate</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-300">{player.totalQuizzes}</p>
                  <p className="text-xs text-slate-500">Quizzes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Badges */}
          <div className="bg-slate-800/80 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">🎖️ Badges</h2>
            {player.userBadges.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No badges yet. Start playing to earn them!
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {player.userBadges.map((ub) => (
                  <div key={ub.badge.id} className="bg-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">{ub.badge.icon}</span>
                    <div>
                      <p className="text-white text-sm font-semibold">{ub.badge.name}</p>
                      <p className="text-slate-400 text-xs">{ub.badge.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-slate-800/80 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">📊 Recent Activity</h2>
            {player.quizAttempts.length === 0 ? (
              <p className="text-slate-500 text-sm">No quiz attempts yet.</p>
            ) : (
              <div className="space-y-3">
                {player.quizAttempts.slice(0, 8).map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {attempt.quiz?.title || 'Quiz'}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {attempt.quiz?.level?.world?.name} •{' '}
                        {formatDistanceToNow(new Date(attempt.completedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-bold">
                        {attempt.correctAnswers}/{attempt.totalQuestions}
                      </p>
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-purple-400 text-xs">+{attempt.xpEarned}xp</span>
                        <span
                          className={`text-xs ${attempt.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {attempt.eloChange >= 0 ? '+' : ''}
                          {attempt.eloChange}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Elo History */}
        {player.eloHistory.length > 0 && (
          <div className="bg-slate-800/80 rounded-2xl p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-4">⚡ Elo History</h2>
            <div className="space-y-2">
              {player.eloHistory.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0"
                >
                  <span className="text-slate-300 text-sm">{h.reason}</span>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold text-sm ${h.change >= 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {h.change >= 0 ? '+' : ''}
                      {h.change}
                    </span>
                    <span className="text-slate-400 text-sm">→ {h.newRating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
