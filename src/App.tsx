import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Journey, PhaseKey, ConceptCard, PHASE_CONFIG } from '@/lib/types'
import { createNewJourney, completePhase, getNextPhase } from '@/lib/game'
import { PhaseNavigation } from '@/components/PhaseNavigation'
import { GameStats } from '@/components/GameStats'
import { BadgeShowcase } from '@/components/BadgeShowcase'
import { BrainstormPhase } from '@/components/phases/BrainstormPhase'
import { StoryPhase, BrandPhase, CodePhase, GitHubPhase } from '@/components/phases/OtherPhases'
import { PRDPhase } from '@/components/phases/PRDPhase'
import { CelebrationDialog } from '@/components/CelebrationDialog'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { Sparkle, Sun, Moon, Globe } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'

function App() {
  const [journey, setJourney] = useKV<Journey>('healfounder-journey', createNewJourney())
  const [view, setView] = useState<'dashboard' | 'phase'>('dashboard')
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('healfounder-theme') === 'dark' ||
      (!localStorage.getItem('healfounder-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  const [celebration, setCelebration] = useState<{
    open: boolean
    phaseName: string
    xpEarned: number
    badgeName?: string
    nextPhase?: PhaseKey | null
  }>({ open: false, phaseName: '', xpEarned: 0 })

  const { language, setLanguage, t, isRTL } = useLanguage()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('healfounder-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('healfounder-theme', 'light')
    }
  }, [isDark])

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
    const updated = completePhase({ ...journey, concept }, 'brainstorm')
    setJourney(updated)
    const config = PHASE_CONFIG['brainstorm']
    setCelebration({
      open: true,
      phaseName: t.phases.brainstorm,
      xpEarned: config.xp,
      badgeName: 'Idea Alchemist',
      nextPhase: getNextPhase('brainstorm'),
    })
  }

  const handlePhaseComplete = (updatedJourney: Journey) => {
    const completedPhase = journey.currentPhase
    const config = PHASE_CONFIG[completedPhase]
    setJourney(updatedJourney)
    setCelebration({
      open: true,
      phaseName: t.phases[completedPhase],
      xpEarned: config.xp,
      nextPhase: getNextPhase(completedPhase),
    })
  }

  const handleCelebrationClose = () => {
    setCelebration((prev) => ({ ...prev, open: false }))
    setView('dashboard')
  }

  const handleCelebrationContinue = () => {
    setCelebration((prev) => ({ ...prev, open: false }))
    if (celebration.nextPhase && journey.phases[celebration.nextPhase]?.unlocked) {
      setJourney((current) => {
        if (!current) return createNewJourney()
        return { ...current, currentPhase: celebration.nextPhase! }
      })
      setView('phase')
    } else {
      setView('dashboard')
    }
  }

  const renderPhase = () => {
    switch (journey.currentPhase) {
      case 'brainstorm':
        return <BrainstormPhase journey={journey} onComplete={handleBrainstormComplete} />
      case 'story':
        return <StoryPhase journey={journey} onComplete={handlePhaseComplete} />
      case 'brand':
        return <BrandPhase journey={journey} onComplete={handlePhaseComplete} />
      case 'prd':
        return <PRDPhase journey={journey} onComplete={handlePhaseComplete} />
      case 'code':
        return <CodePhase journey={journey} onComplete={handlePhaseComplete} />
      case 'github':
        return <GitHubPhase journey={journey} />
    }
  }

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Sparkle weight="fill" className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading">{t.appTitle}</h1>
              <p className="text-xs text-muted-foreground">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 text-sm font-medium"
              title={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
            >
              <Globe className="w-4 h-4" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </Button>

            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {view === 'phase' && (
              <Button variant="outline" onClick={() => setView('dashboard')}>
                {t.backToDashboard}
              </Button>
            )}
          </div>
        </div>
      </header>

      {view === 'dashboard' ? (
        <>
          <PhaseNavigation journey={journey} onPhaseSelect={handlePhaseSelect} />
          
          <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold font-heading">{t.yourStartupJourney}</h2>
              <p className="text-muted-foreground">{t.dashboardSubtitle}</p>
            </div>

            <GameStats journey={journey} />

            <BadgeShowcase journey={journey} />

            <div className="text-center">
              <Button
                size="lg"
                onClick={() => setView('phase')}
                className="text-lg px-8"
              >
                {journey.phases[journey.currentPhase].completed ? t.continueJourney : t.startCurrentPhase}
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

      <CelebrationDialog
        open={celebration.open}
        onClose={handleCelebrationClose}
        onContinue={celebration.nextPhase ? handleCelebrationContinue : undefined}
        phaseName={celebration.phaseName}
        xpEarned={celebration.xpEarned}
        badgeName={celebration.badgeName}
        isRTL={isRTL}
        language={language}
      />

      <Toaster />
    </div>
  )
}

export default App