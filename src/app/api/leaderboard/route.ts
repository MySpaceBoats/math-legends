import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') || 'global'

  if (type === 'weekly') {
    const users = await prisma.user.findMany({
      orderBy: { weeklyXp: 'desc' },
      take: 100,
      select: {
        id: true,
        pseudo: true,
        firstName: true,
        level: true,
        weeklyXp: true,
        eloRating: true,
        weeklyElo: true,
        avatarUrl: true,
      },
    })
    return NextResponse.json(
      users.map((u, i) => ({ ...u, rank: i + 1, xp: u.weeklyXp, elo: u.weeklyElo }))
    )
  }

  if (type === 'monthly') {
    const users = await prisma.user.findMany({
      orderBy: { monthlyXp: 'desc' },
      take: 100,
      select: {
        id: true,
        pseudo: true,
        firstName: true,
        level: true,
        monthlyXp: true,
        eloRating: true,
        monthlyElo: true,
        avatarUrl: true,
      },
    })
    return NextResponse.json(
      users.map((u, i) => ({ ...u, rank: i + 1, xp: u.monthlyXp, elo: u.monthlyElo }))
    )
  }

  const users = await prisma.user.findMany({
    orderBy: { xp: 'desc' },
    take: 100,
    select: {
      id: true,
      pseudo: true,
      firstName: true,
      level: true,
      xp: true,
      eloRating: true,
      avatarUrl: true,
    },
  })
  return NextResponse.json(users.map((u, i) => ({ ...u, rank: i + 1, elo: u.eloRating })))
}
