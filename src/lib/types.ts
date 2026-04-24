export type PhaseKey = 'brainstorm' | 'story' | 'brand' | 'prd' | 'code' | 'github'

export interface PhaseStatus {
  completed: boolean
  unlocked: boolean
}

export interface ConceptCard {
  problem: string
  targetUsers: string
  solution: string
  keywords: string[]
  timestamp: number
}

export interface Story {
  narrative: string
  tone: 'empathetic' | 'scientific'
  targetPatient: string
  coreProblem: string
  impact: string
  solutionVision: string
  aiScore?: {
    clarity: number
    emotion: number
    healthcare: number
  }
  timestamp: number
}

export interface BrandPersonality {
  archetype: string
  tone: string[]
  values: string[]
  targetFeeling: string
  colorPreference: string
  styleDirection: string
}

export interface Brand {
  name: string
  tagline: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  logo: string
  personality?: BrandPersonality
  timestamp: number
}

export interface PRDSection {
  title: string
  content: string
  completed: boolean
}

export interface PRD {
  sections: {
    problem: PRDSection
    solution: PRDSection
    targetUsers: PRDSection
    features: PRDSection
    metrics: PRDSection
    regulatory: PRDSection
  }
  completeness: number
  timestamp: number
}

export interface GeneratedCode {
  template: 'landing' | 'webapp' | 'dashboard'
  files: Array<{
    path: string
    content: string
  }>
  previewUrl?: string
  timestamp: number
}

export interface GitHubRepo {
  name: string
  url: string
  createdAt: number
  commitSha?: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  timestamp?: number
}

export interface GameState {
  xp: number
  level: number
  badges: Badge[]
  streakDays: number
  lastActiveDate: string
}

export interface Journey {
  id: string
  createdAt: number
  updatedAt: number
  phases: Record<PhaseKey, PhaseStatus>
  currentPhase: PhaseKey
  concept?: ConceptCard
  story?: Story
  brand?: Brand
  prd?: PRD
  code?: GeneratedCode
  githubRepo?: GitHubRepo
  gameState: GameState
}

export const PHASE_CONFIG: Record<PhaseKey, {
  name: string
  icon: string
  xp: number
  description: string
}> = {
  brainstorm: {
    name: 'Brainstorm',
    icon: 'Lightbulb',
    xp: 100,
    description: 'Extract healthcare problems into crisp concept cards'
  },
  story: {
    name: 'Story',
    icon: 'BookOpen',
    xp: 150,
    description: 'Transform your concept into a compelling narrative'
  },
  brand: {
    name: 'Brand',
    icon: 'Palette',
    xp: 120,
    description: 'Generate name, tagline, and visual identity'
  },
  prd: {
    name: 'PRD',
    icon: 'FileText',
    xp: 200,
    description: 'Build a functional product requirements document'
  },
  code: {
    name: 'Code',
    icon: 'Code',
    xp: 250,
    description: 'Turn your PRD into a runnable MVP scaffold'
  },
  github: {
    name: 'GitHub',
    icon: 'GithubLogo',
    xp: 300,
    description: 'Celebrate your complete startup journey'
  }
}

export const BADGES: Badge[] = [
  {
    id: 'idea-alchemist',
    name: 'Idea Alchemist',
    description: 'Complete Brainstorm phase',
    icon: 'Lightbulb',
    earned: false
  },
  {
    id: 'patient-whisperer',
    name: 'Patient Whisperer',
    description: 'Complete Story phase',
    icon: 'BookOpen',
    earned: false
  },
  {
    id: 'identity-shaper',
    name: 'Identity Shaper',
    description: 'Complete Brand phase',
    icon: 'Palette',
    earned: false
  },
  {
    id: 'blueprint-champion',
    name: 'Blueprint Champion',
    description: 'Complete PRD phase',
    icon: 'FileText',
    earned: false
  },
  {
    id: 'code-conjurer',
    name: 'Code Conjurer',
    description: 'Generate code',
    icon: 'Code',
    earned: false
  },
  {
    id: 'repo-rocketeer',
    name: 'Repo Rocketeer',
    description: 'Complete GitHub phase',
    icon: 'GithubLogo',
    earned: false
  },
  {
    id: 'idea-machine',
    name: 'Idea Machine',
    description: 'Generate 10+ unique terms',
    icon: 'Sparkle',
    earned: false
  },
  {
    id: 'insight-seeker',
    name: 'Insight Seeker',
    description: 'Use 3 AI suggestions',
    icon: 'MagicWand',
    earned: false
  }
]
