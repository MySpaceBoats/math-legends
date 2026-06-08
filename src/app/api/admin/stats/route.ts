import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const [totalUsers, totalAttempts, avgSuccessRate] = await Promise.all([
    prisma.user.count(),
    prisma.quizAttempt.count(),
    prisma.user.aggregate({ _avg: { successRate: true } }),
  ])

  const recentAttempts = await prisma.quizAttempt.findMany({
    take: 10,
    orderBy: { completedAt: 'desc' },
    include: {
      user: { select: { pseudo: true } },
      quiz: { select: { title: true } },
    },
  })

  return NextResponse.json({
    totalUsers,
    totalAttempts,
    avgSuccessRate: avgSuccessRate._avg.successRate ?? 0,
    recentAttempts,
  })
}
