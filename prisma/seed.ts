import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const worlds = [
  {
    name: 'Arithmetic',
    description: 'Master the foundations: addition, subtraction, multiplication, division',
    order: 1,
  },
  {
    name: 'Fractions',
    description: 'Conquer fractions, decimals, and percentages',
    order: 2,
  },
  {
    name: 'Geometry',
    description: 'Explore shapes, angles, areas, and volumes',
    order: 3,
  },
  {
    name: 'Algebra',
    description: 'Solve equations and discover the power of unknowns',
    order: 4,
  },
  {
    name: 'Functions',
    description: 'Understand functions, graphs, and mathematical relationships',
    order: 5,
  },
]

const badges = [
  { name: 'First Win', description: 'Complete your first quiz', icon: '🏆', condition: 'first-win' },
  { name: 'Perfect Score', description: 'Get 10/10 on a quiz', icon: '⭐', condition: 'perfect-score' },
  {
    name: 'Speed Master',
    description: 'Answer a question in under 3 seconds',
    icon: '⚡',
    condition: 'speed-master',
  },
  { name: 'Streak 7 Days', description: 'Play 7 days in a row', icon: '🔥', condition: 'streak-7' },
  { name: 'Math Beginner', description: 'Reach Level 2', icon: '📚', condition: 'math-beginner' },
  {
    name: 'Geometry Explorer',
    description: 'Complete a Geometry quiz',
    icon: '📐',
    condition: 'geometry-explorer',
  },
  { name: 'Elo Climber', description: 'Reach 1200 Elo rating', icon: '📈', condition: 'elo-climber' },
  { name: 'Quiz Master', description: 'Complete 50 quizzes', icon: '🎮', condition: 'quiz-master' },
]

function generateArithmeticQuestions(levelOrder: number): {
  text: string
  options: string[]
  correctAnswer: string
  order: number
}[] {
  const questions = []
  for (let i = 1; i <= 10; i++) {
    const a = Math.floor(Math.random() * (10 * levelOrder)) + 1
    const b = Math.floor(Math.random() * (10 * levelOrder)) + 1
    const ops = ['+', '-', '×', '÷']
    const op = ops[Math.floor(Math.random() * (levelOrder <= 2 ? 2 : ops.length))]
    let answer: number
    let q: string

    if (op === '+') {
      answer = a + b
      q = `${a} + ${b} = ?`
    } else if (op === '-') {
      const big = Math.max(a, b)
      const small = Math.min(a, b)
      answer = big - small
      q = `${big} - ${small} = ?`
    } else if (op === '×') {
      const x = Math.min(a, 12)
      const y = Math.min(b, 12)
      answer = x * y
      q = `${x} × ${y} = ?`
    } else {
      const divisor = (Math.min(b, 12) || 1)
      const product = divisor * (Math.floor(Math.random() * 9) + 1)
      answer = product / divisor
      q = `${product} ÷ ${divisor} = ?`
    }

    const correct = String(answer)
    const wrongs = new Set<string>()
    while (wrongs.size < 3) {
      const w = answer + Math.floor(Math.random() * 10) - 5
      if (w !== answer && w >= 0) wrongs.add(String(w))
    }
    const opts = [...Array.from(wrongs), correct].sort(() => Math.random() - 0.5)
    questions.push({ text: q, options: opts, correctAnswer: correct, order: i })
  }
  return questions
}

async function main() {
  await prisma.badge.deleteMany()
  await prisma.badge.createMany({ data: badges })

  await prisma.world.deleteMany()

  for (const worldData of worlds) {
    const world = await prisma.world.create({ data: worldData })
    for (let l = 1; l <= 10; l++) {
      const level = await prisma.level.create({
        data: {
          worldId: world.id,
          name: `Level ${l}`,
          order: l,
          difficulty: Math.ceil(l / 3),
        },
      })
      for (let q = 1; q <= 10; q++) {
        const quiz = await prisma.quiz.create({
          data: {
            levelId: level.id,
            title: `${world.name} ${l}.${q}`,
            order: q,
            timeLimit: Math.max(10, 30 - l),
          },
        })
        const questions = generateArithmeticQuestions(l)
        for (const qData of questions) {
          await prisma.question.create({
            data: {
              quizId: quiz.id,
              text: qData.text,
              options: qData.options,
              correctAnswer: qData.correctAnswer,
              order: qData.order,
            },
          })
        }
      }
    }
  }

  console.log('Seed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
