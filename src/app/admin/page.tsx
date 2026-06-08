'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface QuizAttempt {
  id: string
  correctAnswers: number
  totalQuestions: number
  xpEarned: number
  eloChange: number
  completedAt: string
  user?: { pseudo: string }
  quiz?: { title: string }
}

interface AdminStats {
  totalUsers: number
  totalAttempts: number
  avgSuccessRate: number
  recentAttempts: QuizAttempt[]
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)

  useEffect(() => {
    const u = localStorage.getItem('mathlegendsUser')
    if (!u) {
      router.push('/')
      return
    }
    const parsed = JSON.parse(u)
    if (!parsed.isAdmin) {
      router.push('/play')
      return
    }
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
  }, [router])

  if (!stats)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white animate-pulse">Loading admin dashboard...</div>
      </div>
    )

  const statCards = [
    {
      label: 'Total Players',
      value: stats.totalUsers,
      icon: '👥',
      color: 'from-purple-900/50 to-indigo-900/50',
    },
    {
      label: 'Total Attempts',
      value: stats.totalAttempts,
      icon: '🎮',
      color: 'from-green-900/50 to-teal-900/50',
    },
    {
      label: 'Avg Success Rate',
      value: `${stats.avgSuccessRate?.toFixed(1)}%`,
      icon: '📊',
      color: 'from-yellow-900/50 to-orange-900/50',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">⚡ Admin Dashboard</h1>
            <p className="text-slate-400 text-sm">Math Legends Control Center</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/play')}
              className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-4 py-2 text-sm transition-all"
            >
              Back to Game
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`bg-gradient-to-br ${s.color} border border-slate-700 rounded-2xl p-6`}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700">
                  <th className="text-left py-2">Player</th>
                  <th className="text-left py-2">Quiz</th>
                  <th className="text-right py-2">Score</th>
                  <th className="text-right py-2">XP</th>
                  <th className="text-right py-2">Elo</th>
                  <th className="text-right py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAttempts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 text-white font-medium">{a.user?.pseudo}</td>
                    <td className="py-3 text-slate-400">{a.quiz?.title}</td>
                    <td className="py-3 text-right text-white">
                      {a.correctAnswers}/{a.totalQuestions}
                    </td>
                    <td className="py-3 text-right text-purple-400">+{a.xpEarned}</td>
                    <td
                      className={`py-3 text-right font-medium ${a.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {a.eloChange >= 0 ? '+' : ''}
                      {a.eloChange}
                    </td>
                    <td className="py-3 text-right text-slate-500 text-xs">
                      {new Date(a.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
