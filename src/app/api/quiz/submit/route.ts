import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateEloChange } from '@/lib/elo'
import { getLevelFromXP } from '@/lib/xp'

export async function POST(req: NextRequest) {
  const { userId, quizId, answers, responseTimes } = await req.json()

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
      level: true,
    },
  })

  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  let correctAnswers = 0
  const errors: { questionId: number; given: string; correct: string }[] = []

  quiz.questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) {
      correctAnswers++
    } else {
      errors.push({ questionId: q.id, given: answers[i], correct: q.correctAnswer })
    }
  })

  const score = correctAnswers
  const totalQuestions = quiz.questions.length
  const isPerfect = score === totalQuestions

  let xpEarned = correctAnswers * 10 + 50
  if (isPerfect) xpEarned += 100

  const avgResponseTime =
    responseTimes.length > 0
      ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length
      : quiz.timeLimit

  const eloChange = calculateEloChange(
    score,
    totalQuestions,
    quiz.level.difficulty,
    avgResponseTime,
    quiz.timeLimit
  )

  const newXP = user.xp + xpEarned
  const newLevel = getLevelFromXP(newXP)
  const newElo = Math.max(100, user.eloRating + eloChange)

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId,
      score,
      totalQuestions,
      correctAnswers,
      xpEarned,
      eloChange,
      avgResponseTime,
      errors: JSON.stringify(errors),
    },
  })

  const newTotalCorrect = user.totalCorrect + correctAnswers
  const newTotalQuizzes = user.totalQuizzes + 1
  const newSuccessRate = (newTotalCorrect / (newTotalQuizzes * totalQuestions)) * 100

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXP,
      level: newLevel,
      eloRating: newElo,
      weeklyXp: { increment: xpEarned },
      monthlyXp: { increment: xpEarned },
      weeklyElo: newElo,
      monthlyElo: newElo,
      totalQuizzes: { increment: 1 },
      totalCorrect: { increment: correctAnswers },
      successRate: newSuccessRate,
    },
  })

  await prisma.xPTransaction.create({
    data: { userId, amount: xpEarned, reason: `Quiz ${quizId} completed` },
  })

  await prisma.eloHistory.create({
    data: { userId, change: eloChange, newRating: newElo, reason: `Quiz ${quizId}` },
  })

  // Check badges
  const badgesToCheck = await prisma.badge.findMany()
  const userBadges = await prisma.userBadge.findMany({ where: { userId } })
  const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId))
  const newBadges = []

  for (const badge of badgesToCheck) {
    if (earnedBadgeIds.has(badge.id)) continue
    let earned = false
    if (badge.condition === 'first-win') earned = true
    if (badge.condition === 'perfect-score' && isPerfect) earned = true
    if (badge.condition === 'math-beginner' && newLevel >= 2) earned = true
    if (badge.condition === 'elo-climber' && newElo >= 1200) earned = true
    if (badge.condition === 'quiz-master' && user.totalQuizzes + 1 >= 50) earned = true

    if (earned) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
      newBadges.push(badge)
    }
  }

  return NextResponse.json({
    attempt,
    xpEarned,
    eloChange,
    newBadges,
    isPerfect,
    score,
    totalQuestions,
  })
}
