import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ pseudo: string }> }
) {
  const { pseudo } = await params
  const user = await prisma.user.findUnique({
    where: { pseudo },
    include: {
      userBadges: {
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      },
      quizAttempts: {
        orderBy: { completedAt: 'desc' },
        take: 20,
        include: {
          quiz: { include: { level: { include: { world: true } } } },
        },
      },
      eloHistory: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })

  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...publicData } = user
  return NextResponse.json(publicData)
}
