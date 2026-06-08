import { NextRequest, NextResponse } from 'next/server'
import { submitQuiz } from '@/services/quizService'

export async function POST(req: NextRequest) {
  try {
    const { userId, quizId, answers, responseTimes } = await req.json()

    if (!userId || !quizId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await submitQuiz({ userId, quizId, answers, responseTimes: responseTimes ?? [] })

    return NextResponse.json({
      attempt: { id: 'ok' },
      xpEarned: result.xpGained,
      eloChange: result.eloDelta,
      newBadges: result.newBadges,
      isPerfect: result.isPerfect,
      score: result.score,
      totalQuestions: result.totalQuestions,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
