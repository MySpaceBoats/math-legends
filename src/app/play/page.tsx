'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Quiz {
  id: number
  title: string
  order: number
}

interface Level {
  id: number
  name: string
  order: number
  difficulty: number
  quizzes: Quiz[]
}

interface World {
  id: number
  name: string
  description: string
  order: number
  levels: Level[]
}

interface User {
  id: string
  pseudo: string
  firstName: string
  level: number
  xp: number
  eloRating: number
  currentWorld: number
  currentLevel: number
}

export default function PlayPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [worlds, setWorlds] = useState<World[]>([])
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('mathlegendsUser')
    if (!userData) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))
    fetch('/api/worlds')
      .then((r) => r.json())
      .then(setWorlds)
  }, [router])

  if (!user) return null

  const worldEmojis = ['🔢', '½', '📐', '🔣', '📈']

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => {
              setSelectedWorld(null)
              setSelectedLevel(null)
            }}
            className="text-2xl font-black text-white"
          >
            ⚡ MATH LEGENDS
          </button>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-right">
              <p className="text-xs text-slate-400">Legend</p>
              <p className="text-white font-bold">{user.pseudo}</p>
            </div>
            <div className="bg-slate-800 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-slate-400">Level</p>
              <p className="text-purple-400 font-black text-xl">{user.level}</p>
            </div>
            <div className="bg-slate-800 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-slate-400">Elo</p>
              <p className="text-yellow-400 font-black text-xl">{user.eloRating}</p>
            </div>
            <button
              onClick={() => router.push(`/player/${user.pseudo}`)}
              className="bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-4 py-2 text-sm transition-all"
            >
              Profile
            </button>
            <button
              onClick={() => router.push('/leaderboard')}
              className="bg-purple-700 hover:bg-purple-600 text-white rounded-xl px-4 py-2 text-sm transition-all"
            >
              🏆 Rankings
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8">
        {!selectedWorld && (
          <>
            <h1 className="text-4xl font-black text-white mb-2">Choose Your World</h1>
            <p className="text-slate-400 mb-8">Master each world to become a Math Legend</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {worlds.map((world, i) => (
                <button
                  key={world.id}
                  onClick={() => setSelectedWorld(world)}
                  className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-purple-500 rounded-2xl p-6 text-left transition-all hover:scale-105 hover:shadow-xl"
                >
                  <div className="text-5xl mb-4">{worldEmojis[i] || '🎯'}</div>
                  <h3 className="text-xl font-bold text-white">{world.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{world.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                    <span>{world.levels.length} levels</span>
                    <span>•</span>
                    <span>
                      {world.levels.reduce((a, l) => a + l.quizzes.length, 0)} quizzes
                    </span>
                  </div>
                  {user.currentWorld === world.order && (
                    <div className="mt-3 inline-flex items-center gap-1 bg-purple-500/20 text-purple-400 text-xs px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                      Current World
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {selectedWorld && !selectedLevel && (
          <>
            <button
              onClick={() => setSelectedWorld(null)}
              className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
            >
              ← Back to Worlds
            </button>
            <h1 className="text-4xl font-black text-white mb-2">{selectedWorld.name}</h1>
            <p className="text-slate-400 mb-8">{selectedWorld.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedWorld.levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level)}
                  className="bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-purple-500 rounded-xl p-5 text-left transition-all hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-white">{level.name}</h3>
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">
                      {'⭐'.repeat(level.difficulty)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm">{level.quizzes.length} quizzes available</p>
                </button>
              ))}
            </div>
          </>
        )}

        {selectedWorld && selectedLevel && (
          <>
            <button
              onClick={() => setSelectedLevel(null)}
              className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"
            >
              ← Back to {selectedWorld.name}
            </button>
            <h1 className="text-4xl font-black text-white mb-2">{selectedLevel.name}</h1>
            <p className="text-slate-400 mb-8">Complete all quizzes to master this level</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedLevel.quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => router.push(`/quiz/${quiz.id}`)}
                  className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 hover:from-purple-800/50 hover:to-indigo-800/50 border border-purple-800/50 hover:border-purple-500 rounded-xl p-5 text-center transition-all hover:scale-105 hover:shadow-lg"
                >
                  <div className="text-3xl font-black text-purple-400 mb-2">#{quiz.order}</div>
                  <div className="text-sm font-semibold text-white">{quiz.title}</div>
                  <div className="text-xs text-slate-400 mt-1">10 questions</div>
                </button>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
