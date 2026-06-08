import { QuizResult, XPResult } from './types'

export function calculateXP(result: QuizResult): XPResult {
  const base = result.correctAnswers * 10

  let speedMultiplier: number
  if (result.averageResponseTime < 3) {
    speedMultiplier = 1.2
  } else if (result.averageResponseTime < 6) {
    speedMultiplier = 1.0
  } else {
    speedMultiplier = 0.8
  }

  const isPerfect = result.score === 100
  const perfectBonus = isPerfect ? 50 : 0

  const total = Math.round(base * speedMultiplier) + 50 + perfectBonus

  return { base, speedMultiplier, perfectBonus, total }
}
