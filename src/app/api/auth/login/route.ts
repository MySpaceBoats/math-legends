import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { pseudo } = await req.json()

  if (!pseudo) {
    return NextResponse.json({ error: 'Missing pseudo' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { pseudo },
    include: {
      userBadges: { include: { badge: true } },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({ user })
}
