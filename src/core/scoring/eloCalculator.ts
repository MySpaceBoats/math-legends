import { QuizResult, EloResult } from './types'

function getKFactor(currentElo: number): number {
  if (currentElo < 1200) return 40
  if (currentElo <= 1800) return 25
  return 15
}

export function calculateElo(result: QuizResult, currentElo: number): EloResult {
  const kFactor = getKFactor(currentElo)

  // Classic Elo: opponent is the "quiz" represented as a virtual player at 1000
  const opponentRating = 1000
  const expected = 1 / (1 + Math.pow(10, (opponentRating - currentElo) / 400))

  // Performance = 70% score + 30% normalized speed (cap at 30s)
  const normalizedSpeed = Math.max(0, 1 - result.averageResponseTime / 30)
  const performance = (result.score / 100) * 0.7 + normalizedSpeed * 0.3

  const delta = Math.round(kFactor * (performance - expected))
  const clampedDelta = Math.max(-50, Math.min(50, delta))
  const newRating = Math.max(100, currentElo + clampedDelta)

  return { delta: clampedDelta, newRating, kFactor, expected, performance }
}
