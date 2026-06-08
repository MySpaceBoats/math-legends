'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: string
  explanation?: string
  order: number
}

interface Quiz {
  id: number
  title: string
  timeLimit: number
  questions: Question[]
  level: { name: string; difficulty: number; world: { name: string } }
}

export default function QuizPage() {
  const router = useRouter()
  const params = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [user, setUser] = useState<Record<string, unknown> | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [responseTimes, setResponseTimes] = useState<number[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [questionStart, setQuestionStart] = useState(Date.now())
  const [finished, setFinished] = useState(false)
  const [results, setResults] = useState<{
    score: number
    totalQuestions: number
    xpEarned: number
    eloChange: number
    isPerfect: boolean
    newBadges?: { id: string; name: string; icon: string }[]
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const submitQuiz = useCallback(
    async (finalAnswers: string[], finalResponseTimes: number[]) => {
      if (submitting) return
      setSubmitting(true)
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (user as Record<string, unknown>)?.id,
          quizId: parseInt(params.id as string),
          answers: finalAnswers,
          responseTimes: finalResponseTimes,
        }),
      })
      const data = await res.json()
      setResults(data)
      setFinished(true)
      const updatedUser = {
        ...(user as Record<string, unknown>),
        xp: (user?.xp as number) + data.xpEarned,
        eloRating: Math.max(100, (user?.eloRating as number) + data.eloChange),
      }
      localStorage.setItem('mathlegendsUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
    },
    [submitting, user, params.id]
  )

  const advanceQuestion = useCallback(
    (newAnswers: string[], newResponseTimes: number[]) => {
      if (!quiz) return
      if (currentQ + 1 >= quiz.questions.length) {
        submitQuiz(newAnswers, newResponseTimes)
      } else {
        setCurrentQ((q) => q + 1)
        setQuestionStart(Date.now())
        setTimeLeft(quiz.timeLimit)
      }
    },
    [quiz, currentQ, submitQuiz]
  )

  useEffect(() => {
    const userData = localStorage.getItem('mathlegendsUser')
    if (!userData) {
      router.push('/')
      return
    }
    setUser(JSON.parse(userData))
    fetch(`/api/quiz/${params.id}`)
      .then((r) => r.json())
      .then((q: Quiz) => {
        setQuiz(q)
        setTimeLeft(q.timeLimit)
      })
  }, [params.id, router])

  useEffect(() => {
    if (!quiz || finished) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          const elapsed = (Date.now() - questionStart) / 1000
          const newResponseTimes = [...responseTimes, elapsed]
          const newAnswers = [...answers, '']
          setResponseTimes(newResponseTimes)
          setAnswers(newAnswers)
          setSelected(null)
          advanceQuestion(newAnswers, newResponseTimes)
          return quiz.timeLimit
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentQ, quiz, finished, questionStart, answers, responseTimes, advanceQuestion])

  const handleAnswer = (option: string) => {
    if (selected !== null || showResult) return
    if (timerRef.current) clearInterval(timerRef.current)
    const elapsed = (Date.now() - questionStart) / 1000
    setSelected(option)
    const newResponseTimes = [...responseTimes, elapsed]
    const newAnswers = [...answers, option]
    setResponseTimes(newResponseTimes)
    setAnswers(newAnswers)
    setShowResult(true)

    setTimeout(() => {
      setShowResult(false)
      setSelected(null)
      advanceQuestion(newAnswers, newResponseTimes)
    }, 1500)
  }

  if (!quiz || !user)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    )

  if (finished && results) {
    const isPerfect = results.score === results.totalQuestions
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="text-6xl mb-4">
            {isPerfect ? '🏆' : results.score >= results.totalQuestions * 0.7 ? '⭐' : '📚'}
          </div>
          <h2 className="text-3xl font-black text-white mb-2">
            {isPerfect
              ? 'PERFECT!'
              : results.score >= results.totalQuestions * 0.7
                ? 'Well Done!'
                : 'Keep Training!'}
          </h2>
          <p className="text-slate-400 mb-6">{quiz.title}</p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700 rounded-xl p-4">
              <p className="text-3xl font-black text-white">
                {results.score}/{results.totalQuestions}
              </p>
              <p className="text-xs text-slate-400 mt-1">Score</p>
            </div>
            <div className="bg-purple-900/50 rounded-xl p-4">
              <p className="text-3xl font-black text-purple-400">+{results.xpEarned}</p>
              <p className="text-xs text-slate-400 mt-1">XP</p>
            </div>
            <div
              className={`rounded-xl p-4 ${results.eloChange >= 0 ? 'bg-green-900/50' : 'bg-red-900/50'}`}
            >
              <p
                className={`text-3xl font-black ${results.eloChange >= 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {results.eloChange >= 0 ? '+' : ''}
                {results.eloChange}
              </p>
              <p className="text-xs text-slate-400 mt-1">Elo</p>
            </div>
          </div>

          {results.newBadges && results.newBadges.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-yellow-400 font-bold mb-2">🎖️ New Badges!</p>
              {results.newBadges.map((b) => (
                <p key={b.id} className="text-yellow-300 text-sm">
                  {b.icon} {b.name}
                </p>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/play')}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-all"
            >
              World Map
            </button>
            <button
              onClick={() => {
                setFinished(false)
                setCurrentQ(0)
                setAnswers([])
                setResponseTimes([])
                setTimeLeft(quiz.timeLimit)
                setResults(null)
                setSubmitting(false)
                setQuestionStart(Date.now())
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const question = quiz.questions[currentQ]
  const isCorrect = selected === question?.correctAnswer

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 flex flex-col">
      {/* Quiz Header */}
      <div className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">
              {quiz.level.world.name} • {quiz.level.name}
            </p>
            <p className="text-white font-semibold">{quiz.title}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              Question {currentQ + 1}/{quiz.questions.length}
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 transition-all ${timeLeft <= 5 ? 'border-red-500 text-red-400 animate-pulse' : 'border-purple-500 text-purple-400'}`}
            >
              {timeLeft}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-3">
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(currentQ / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-8 mb-6 text-center">
            <p className="text-2xl font-bold text-white leading-relaxed">{question?.text}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question?.options.map((option, i) => {
              let btnClass =
                'bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-purple-500 text-white'
              if (showResult && selected === option) {
                btnClass = isCorrect
                  ? 'bg-green-900/80 border border-green-500 text-green-300'
                  : 'bg-red-900/80 border border-red-500 text-red-300'
              } else if (showResult && option === question.correctAnswer) {
                btnClass = 'bg-green-900/80 border border-green-500 text-green-300'
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(option)}
                  disabled={showResult || selected !== null}
                  className={`${btnClass} rounded-xl p-5 text-center font-semibold text-lg transition-all hover:scale-105 disabled:hover:scale-100 disabled:cursor-default`}
                >
                  <span className="text-slate-500 mr-2">{String.fromCharCode(65 + i)}.</span>
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
