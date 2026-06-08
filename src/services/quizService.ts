import { prisma } from '@/lib/db'
import { processQuizResult } from '@/core/scoring/scoringEngine'
import { getLevelFromXP } from '@/lib/xp'
import { eventBus } from '@/core/events/eventBus'
import type { QuizResult } from '@/core/scoring/types'

export type SubmitQuizInput = {
  userId: string
  quizId: number
  answers: string[]
  responseTimes: number[]
}

export type SubmitQuizOutput = {
  score: number
  totalQuestions: number
  correctAnswers: number
  xpGained: number
  eloDelta: number
  newElo: number
  newLevel: number
  badgesAwarded: string[]
  newBadges: Array<{ id: string; name: string; icon: string; description: string }>
  isPerfect: boolean
  errors: Array<{ questionId: number; given: string; correct: string }>
}

export async function submitQuiz(input: SubmitQuizInput): Promise<SubmitQuizOutput> {
  const { userId, quizId, answers, responseTimes } = input

  const [quiz, user] = await Promise.all([
    prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { orderBy: { order: 'asc' } }, level: true },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])

  if (!quiz) throw new Error('Quiz not found')
  if (!user) throw new Error('User not found')

  // Grade answers
  let correctAnswers = 0
  const errors: Array<{ questionId: number; given: string; correct: string }> = []
  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) {
      correctAnswers++
    } else {
      errors.push({ questionId: q.id, given: answers[i] ?? '', correct: q.correctAnswer })
    }
  })

  const totalQuestions = quiz.questions.length
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : quiz.timeLimit
  const duration = responseTimes.reduce((a, b) => a + b, 0)

  const quizResult: QuizResult = {
    userId,
    quizId: String(quizId),
    score,
    correctAnswers,
    totalQuestions,
    averageResponseTime: avgResponseTime,
    difficulty: quiz.level.difficulty,
    duration,
  }

  const scoring = processQuizResult(quizResult, user.eloRating)
  const newXP = user.xp + scoring.xpGained
  const newLevel = getLevelFromXP(newXP)
  const isPerfect = score === 100
  const didLevelUp = newLevel > user.level

  // Persist everything in a transaction
  const eloBefore = user.eloRating

  const [attempt] = await prisma.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.create({
      data: {
        userId,
        quizId,
        score: correctAnswers,
        totalQuestions,
        correctAnswers,
        xpEarned: scoring.xpGained,
        eloChange: scoring.eloDelta,
        avgResponseTime,
        errors: JSON.stringify(errors),
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel,
        eloRating: scoring.newElo,
        weeklyXp: { increment: scoring.xpGained },
        monthlyXp: { increment: scoring.xpGained },
        weeklyElo: scoring.newElo,
        monthlyElo: scoring.newElo,
        totalQuizzes: { increment: 1 },
        totalCorrect: { increment: correctAnswers },
        successRate:
          ((user.totalCorrect + correctAnswers) /
            ((user.totalQuizzes + 1) * totalQuestions)) *
          100,
        updatedAt: new Date(),
      },
    })

    await tx.xPTransaction.create({
      data: { userId, amount: scoring.xpGained, reason: `Quiz ${quizId}` },
    })

    await tx.eloHistory.create({
      data: {
        userId,
        change: scoring.eloDelta,
        newRating: scoring.newElo,
        reason: `Quiz ${quizId}`,
      },
    })

    return [attempt]
  })

  // Award badges
  const allBadges = await prisma.badge.findMany()
  const existingUserBadges = await prisma.userBadge.findMany({ where: { userId } })
  const earnedIds = new Set(existingUserBadges.map((ub) => ub.badgeId))
  const newBadges: Array<{ id: string; name: string; icon: string; description: string }> = []

  const conditionsToCheck = new Set([
    ...scoring.badgesAwarded,
    'first-win',
    ...(newLevel >= 2 ? ['math-beginner'] : []),
    ...(scoring.newElo >= 1200 ? ['elo-climber'] : []),
    ...(user.totalQuizzes + 1 >= 50 ? ['quiz-master'] : []),
  ])

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue
    if (conditionsToCheck.has(badge.condition)) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
      newBadges.push({ id: badge.id, name: badge.name, icon: badge.icon, description: badge.description })
    }
  }

  // Emit events (fire and forget)
  void eventBus.emit({ type: 'QUIZ_COMPLETED', userId, payload: { quizId, score }, timestamp: Date.now() })
  void eventBus.emit({ type: 'XP_GAINED', userId, payload: { amount: scoring.xpGained }, timestamp: Date.now() })
  void eventBus.emit({ type: 'ELO_UPDATED', userId, payload: { before: eloBefore, after: scoring.newElo, delta: scoring.eloDelta }, timestamp: Date.now() })
  for (const badge of newBadges) {
    void eventBus.emit({ type: 'BADGE_AWARDED', userId, payload: { badge: badge.name }, timestamp: Date.now() })
  }
  if (didLevelUp) {
    void eventBus.emit({ type: 'LEVEL_UP', userId, payload: { newLevel }, timestamp: Date.now() })
  }

  return {
    score: correctAnswers,
    totalQuestions,
    correctAnswers,
    xpGained: scoring.xpGained,
    eloDelta: scoring.eloDelta,
    newElo: scoring.newElo,
    newLevel,
    badgesAwarded: scoring.badgesAwarded,
    newBadges,
    isPerfect,
    errors,
  }
}
