export type QuizResult = {
  userId: string
  quizId: string
  score: number          // 0–100 normalized percentage
  correctAnswers: number
  totalQuestions: number
  averageResponseTime: number  // seconds
  difficulty: number
  duration: number       // total quiz duration in seconds
}

export type XPResult = {
  base: number
  speedMultiplier: number
  perfectBonus: number
  total: number
}

export type EloResult = {
  delta: number
  newRating: number
  kFactor: number
  expected: number
  performance: number
}

export type ScoringResult = {
  xpGained: number
  xpBreakdown: XPResult
  eloDelta: number
  newElo: number
  badgesAwarded: string[]
}
