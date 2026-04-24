import { Journey, GameState, PhaseKey, PHASE_CONFIG, BADGES, Badge } from './types'

export function createNewJourney(): Journey {
  return {
    id: `journey-${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    currentPhase: 'brainstorm',
    phases: {
      brainstorm: { completed: false, unlocked: true },
      story: { completed: false, unlocked: false },
      brand: { completed: false, unlocked: false },
      prd: { completed: false, unlocked: false },
      code: { completed: false, unlocked: false },
      github: { completed: false, unlocked: false }
    },
    gameState: {
      xp: 0,
      level: 1,
      badges: BADGES.map(b => ({ ...b })),
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0]
    }
  }
}

export function calculateLevel(xp: number): number {
  return Math.min(Math.floor(xp / 200) + 1, 10)
}

export function getXPForNextLevel(level: number): number {
  return level * 200
}

export function completePhase(journey: Journey, phase: PhaseKey): Journey {
  const updated = { ...journey }
  updated.phases[phase].completed = true
  updated.updatedAt = Date.now()
  
  const phaseXP = PHASE_CONFIG[phase].xp
  updated.gameState.xp += phaseXP
  updated.gameState.level = calculateLevel(updated.gameState.xp)
  
  const badgeId = getBadgeIdForPhase(phase)
  if (badgeId) {
    const badgeIndex = updated.gameState.badges.findIndex(b => b.id === badgeId)
    if (badgeIndex !== -1 && !updated.gameState.badges[badgeIndex].earned) {
      updated.gameState.badges[badgeIndex].earned = true
      updated.gameState.badges[badgeIndex].timestamp = Date.now()
    }
  }
  
  const nextPhase = getNextPhase(phase)
  if (nextPhase) {
    updated.phases[nextPhase].unlocked = true
    updated.currentPhase = nextPhase
  }
  
  return updated
}

export function getBadgeIdForPhase(phase: PhaseKey): string | null {
  const map: Record<PhaseKey, string> = {
    brainstorm: 'idea-alchemist',
    story: 'patient-whisperer',
    brand: 'identity-shaper',
    prd: 'blueprint-champion',
    code: 'code-conjurer',
    github: 'repo-rocketeer'
  }
  return map[phase] || null
}

export function getNextPhase(phase: PhaseKey): PhaseKey | null {
  const order: PhaseKey[] = ['brainstorm', 'story', 'brand', 'prd', 'code', 'github']
  const currentIndex = order.indexOf(phase)
  return currentIndex < order.length - 1 ? order[currentIndex + 1] : null
}

export function awardBadge(journey: Journey, badgeId: string): Journey {
  const updated = { ...journey }
  const badgeIndex = updated.gameState.badges.findIndex(b => b.id === badgeId)
  if (badgeIndex !== -1 && !updated.gameState.badges[badgeIndex].earned) {
    updated.gameState.badges[badgeIndex].earned = true
    updated.gameState.badges[badgeIndex].timestamp = Date.now()
  }
  return updated
}

export function getPhaseOrder(): PhaseKey[] {
  return ['brainstorm', 'story', 'brand', 'prd', 'code', 'github']
}

export function formatXP(xp: number): string {
  return xp.toLocaleString()
}
