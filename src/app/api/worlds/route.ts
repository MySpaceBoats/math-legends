import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const worlds = await prisma.world.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      levels: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          quizzes: { where: { isActive: true }, orderBy: { order: 'asc' } },
        },
      },
    },
  })
  return NextResponse.json(worlds)
}
