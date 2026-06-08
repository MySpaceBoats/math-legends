import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { firstName, pseudo } = await req.json()

  if (!firstName || !pseudo) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { pseudo } })
  if (existing) {
    return NextResponse.json({ error: 'Pseudo already taken' }, { status: 409 })
  }

  const user = await prisma.user.create({
    data: { firstName, pseudo },
  })

  return NextResponse.json({ user })
}
