import { QuizResult } from './types'

type BadgeRule = {
  code: string
  check: (result: QuizResult) => boolean
}

const BADGE_RULES: BadgeRule[] = [
  {
    code: 'perfect-score',
    check: (r) => r.score === 100,
  },
  {
    code: 'speed-master',
    check: (r) => r.averageResponseTime < 2,
  },
  {
    code: 'survivor',
    check: (r) => r.totalQuestions >= 10 && r.correctAnswers >= 1,
  },
]

export function evaluateBadges(result: QuizResult): string[] {
  return BADGE_RULES
    .filter((rule) => rule.check(result))
    .map((rule) => rule.code)
}
