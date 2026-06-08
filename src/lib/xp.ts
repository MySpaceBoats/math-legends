export function getXPForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(100 * Math.pow(level - 1, 1.5))
}

export function getLevelFromXP(xp: number): number {
  let level = 1
  while (getXPForLevel(level + 1) <= xp) {
    level++
    if (level >= 100) break
  }
  return level
}

export function getXPProgress(xp: number): {
  level: number
  currentXP: number
  nextLevelXP: number
  progress: number
} {
  const level = getLevelFromXP(xp)
  const currentLevelXP = getXPForLevel(level)
  const nextLevelXP = getXPForLevel(level + 1)
  const currentXP = xp - currentLevelXP
  const needed = nextLevelXP - currentLevelXP
  const progress = needed > 0 ? (currentXP / needed) * 100 : 100
  return { level, currentXP, nextLevelXP: needed, progress }
}
