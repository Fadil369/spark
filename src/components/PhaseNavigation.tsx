import { PhaseKey, Journey, PHASE_CONFIG } from '@/lib/types'
import { getPhaseOrder } from '@/lib/game'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  Lightbulb, 
  BookOpen, 
  Palette, 
  FileText, 
  Code, 
  GithubLogo, 
  Lock, 
  Check,
  type Icon as PhosphorIcon
} from '@phosphor-icons/react'

interface PhaseNavigationProps {
  journey: Journey
  onPhaseSelect: (phase: PhaseKey) => void
}

const ICON_MAP: Record<string, PhosphorIcon> = {
  Lightbulb,
  BookOpen,
  Palette,
  FileText,
  Code,
  GithubLogo
}

export function PhaseNavigation({ journey, onPhaseSelect }: PhaseNavigationProps) {
  const phases = getPhaseOrder()
  const { t } = useLanguage()

  return (
    <div className="w-full bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="hidden md:flex items-center justify-between gap-2">
          {phases.map((phaseKey, index) => {
            const config = PHASE_CONFIG[phaseKey]
            const status = journey.phases[phaseKey]
            const Icon = ICON_MAP[config.icon]
            const isActive = journey.currentPhase === phaseKey
            const isCompleted = status.completed
            const isLocked = !status.unlocked
            const phaseName = t.phases[phaseKey]

            return (
              <div key={phaseKey} className="flex items-center flex-1">
                <button
                  onClick={() => !isLocked && onPhaseSelect(phaseKey)}
                  disabled={isLocked}
                  className={cn(
                    'relative flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-200 w-full',
                    isActive && 'bg-primary/10 border-2 border-primary pulse-glow',
                    !isActive && !isLocked && 'hover:bg-muted cursor-pointer',
                    isLocked && 'opacity-40 cursor-not-allowed',
                    isCompleted && !isActive && 'bg-muted'
                  )}
                >
                  <div className={cn(
                    'relative w-12 h-12 rounded-full flex items-center justify-center transition-all',
                    isActive && 'bg-primary text-primary-foreground scale-110',
                    isCompleted && !isActive && 'bg-primary/20 text-primary',
                    !isCompleted && !isActive && !isLocked && 'bg-secondary text-secondary-foreground',
                    isLocked && 'bg-muted text-muted-foreground'
                  )}>
                    {isCompleted ? (
                      <Check weight="bold" className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock weight="bold" className="w-5 h-5" />
                    ) : (
                      <Icon className="w-6 h-6" weight={isActive ? 'fill' : 'regular'} />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      'text-sm font-semibold',
                      isActive && 'text-primary',
                      isCompleted && !isActive && 'text-foreground',
                      !isCompleted && !isActive && 'text-muted-foreground'
                    )}>
                      {phaseName}
                    </div>
                  </div>
                </button>
                {index < phases.length - 1 && (
                  <div className={cn(
                    'h-0.5 w-8 mx-1 transition-colors',
                    status.completed ? 'bg-primary' : 'bg-border'
                  )} />
                )}
              </div>
            )
          })}
        </div>

        <div className="md:hidden flex flex-col gap-2">
          {phases.map((phaseKey) => {
            const config = PHASE_CONFIG[phaseKey]
            const status = journey.phases[phaseKey]
            const Icon = ICON_MAP[config.icon]
            const isActive = journey.currentPhase === phaseKey
            const isCompleted = status.completed
            const isLocked = !status.unlocked
            const phaseName = t.phases[phaseKey]

            return (
              <button
                key={phaseKey}
                onClick={() => !isLocked && onPhaseSelect(phaseKey)}
                disabled={isLocked}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-lg transition-all',
                  isActive && 'bg-primary/10 border-2 border-primary',
                  !isActive && !isLocked && 'hover:bg-muted',
                  isLocked && 'opacity-40',
                  isCompleted && !isActive && 'bg-muted'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && !isActive && 'bg-primary/20 text-primary',
                  !isCompleted && !isActive && !isLocked && 'bg-secondary text-secondary-foreground',
                  isLocked && 'bg-muted text-muted-foreground'
                )}>
                  {isCompleted ? (
                    <Check weight="bold" className="w-5 h-5" />
                  ) : isLocked ? (
                    <Lock weight="bold" className="w-4 h-4" />
                  ) : (
                    <Icon className="w-5 h-5" weight={isActive ? 'fill' : 'regular'} />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className={cn(
                    'font-semibold',
                    isActive && 'text-primary'
                  )}>
                    {phaseName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

