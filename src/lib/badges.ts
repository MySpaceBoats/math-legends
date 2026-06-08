export const BADGE_CONDITIONS: Record<string, (stats: Record<string, unknown>) => boolean> = {
  'first-win': (stats) => (stats.totalQuizzes as number) >= 1,
  'perfect-score': (stats) => stats.hasPerfectScore as boolean,
  'speed-master': (stats) => stats.hasSpeedRecord as boolean,
  'streak-7': (stats) => (stats.streak as number) >= 7,
  'math-beginner': (stats) => (stats.level as number) >= 2,
  'geometry-explorer': (stats) =>
    !!(stats.worldsVisited as number[])?.includes(3),
  'elo-climber': (stats) => (stats.eloRating as number) >= 1200,
  'quiz-master': (stats) => (stats.totalQuizzes as number) >= 50,
}
