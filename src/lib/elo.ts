export function calculateEloChange(
  score: number,
  totalQuestions: number,
  difficulty: number,
  avgResponseTime: number,
  timeLimit: number
): number {
  const scoreRatio = score / totalQuestions
  const speedBonus = Math.max(0, 1 - avgResponseTime / timeLimit)
  const performance = scoreRatio * 0.7 + speedBonus * 0.3
  const K = 32 * difficulty
  const expectedScore = 0.5
  const change = Math.round(K * (performance - expectedScore))
  return Math.max(-50, Math.min(50, change))
}
