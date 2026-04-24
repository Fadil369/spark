import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Journey, PhaseKey, ConceptCard } from '@/lib/types'
import { createNewJourney, completePhase } from '@/lib/game'
import { PhaseNavigation } from '@/components/PhaseNavigation'
import { GameStats } from '@/components/GameStats'
import { BadgeShowcase } from '@/components/BadgeShowcase'
import { BrainstormPhase } from '@/components/phases/BrainstormPhase'
import { StoryPhase, BrandPhase, PRDPhase, CodePhase, GitHubPhase } from '@/components/phases/OtherPhases'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { Sparkle } from '@phosphor-icons/react'

function App() {
  const [journey, setJourney] = useKV<Journey>('healfounder-journey', createNewJourney())
  const [view, setView] = useState<'dashboard' | 'phase'>('dashboard')

  if (!journey) {
    return null
  }

  const handlePhaseSelect = (phase: PhaseKey) => {
    if (journey.phases[phase].unlocked) {
      setJourney((current) => {
        if (!current) return createNewJourney()
        return { ...current, currentPhase: phase }
      })
      setView('phase')
    }
  }

  const handleBrainstormComplete = (concept: ConceptCard) => {
    setJourney((current) => {
      if (!current) return createNewJourney()
      return completePhase({ ...current, concept }, 'brainstorm')
    })
    setView('dashboard')
  }

  const handlePhaseComplete = (updatedJourney: Journey) => {
    setJourney(updatedJourney)
    setView('dashboard')
  }

  const renderPhase = () => {
    switch (journey.currentPhase) {
      case 'brainstorm':
        return <BrainstormPhase journey={journey} onComplete={handleBrainstormComplete} />
      case 'story':
        return <StoryPhase journey={journey} onComplete={handlePhaseComplete} />
      case 'brand':
        return <BrandPhase journey={journey} />
      case 'prd':
        return <PRDPhase journey={journey} />
      case 'code':
        return <CodePhase journey={journey} />
      case 'github':
        return <GitHubPhase journey={journey} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Sparkle weight="fill" className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading">HealFounder</h1>
              <p className="text-xs text-muted-foreground">Build your healthcare startup</p>
            </div>
          </div>
          {view === 'phase' && (
            <Button variant="outline" onClick={() => setView('dashboard')}>
              Back to Dashboard
            </Button>
          )}
        </div>
      </header>

      {view === 'dashboard' ? (
        <>
          <PhaseNavigation journey={journey} onPhaseSelect={handlePhaseSelect} />
          
          <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">Your Startup Journey</h2>
              <p className="text-muted-foreground">
                Complete each phase to build your healthcare startup from idea to GitHub
              </p>
            </div>

            <GameStats journey={journey} />

            <BadgeShowcase journey={journey} />

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => setView('phase')}
                className="text-lg px-8"
              >
                {journey.phases[journey.currentPhase].completed ? 'Continue Journey' : 'Start Current Phase'}
              </Button>
            </div>
          </main>
        </>
      ) : (
        <>
          <PhaseNavigation journey={journey} onPhaseSelect={handlePhaseSelect} />
          
          <main className="max-w-7xl mx-auto px-4 py-8">
            {renderPhase()}
          </main>
        </>
      )}

      <Toaster />
    </div>
  )
}

export default App