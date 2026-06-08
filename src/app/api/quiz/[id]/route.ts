import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id: parseInt(id) },
    include: {
      questions: { orderBy: { order: 'asc' } },
      level: { include: { world: true } },
    },
  })

  if (!quiz) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(quiz)
}
