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
import { WelcomeScreen } from '@/components/WelcomeScreen'
import { Button } from '@/components/ui/button'
import { Toaster } from '@/components/ui/sonner'
import { Sun, Moon, Globe } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { parseRoute, navigate, Route } from '@/lib/router'
import { SparkLogo } from '@/components/SparkLogo'

function App() {
  const [journey, setJourney] = useKV<Journey>('healfounder-journey', createNewJourney())
  const [hasSeenWelcome, setHasSeenWelcome] = useKV<boolean>('healfounder-seen-welcome', false)
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash))
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
    const handleHashChange = () => {
      setRoute(parseRoute(window.location.hash))
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('healfounder-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('healfounder-theme', 'light')
    }
  }, [isDark])

  if (!journey || hasSeenWelcome === undefined) {
    return null
  }

  if (!hasSeenWelcome) {
    return <WelcomeScreen onStart={() => {
      setHasSeenWelcome(true)
      navigate({ view: 'dashboard' })
    }} />
  }

  const handlePhaseSelect = (phase: PhaseKey) => {
    if (journey.phases[phase].unlocked) {
      setJourney((current) => {
        if (!current) return createNewJourney()
        return { ...current, currentPhase: phase }
      })
      navigate({ view: 'phase', phase })
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
    navigate({ view: 'dashboard' })
  }

  const handleCelebrationContinue = () => {
    setCelebration((prev) => ({ ...prev, open: false }))
    if (celebration.nextPhase && journey.phases[celebration.nextPhase]?.unlocked) {
      setJourney((current) => {
        if (!current) return createNewJourney()
        return { ...current, currentPhase: celebration.nextPhase! }
      })
      navigate({ view: 'phase', phase: celebration.nextPhase })
    } else {
      navigate({ view: 'dashboard' })
    }
  }

  const renderPhase = () => {
    const currentPhase = route.view === 'phase' ? route.phase : journey.currentPhase
    switch (currentPhase) {
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
            <div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-primary-foreground/20 flex items-center justify-center cursor-pointer hover:opacity-80 transition-all hover:scale-105 shadow-lg"
              onClick={() => navigate({ view: 'dashboard' })}
            >
              <SparkLogo className="w-6 h-6 text-primary-foreground drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading">{t.appTitle}</h1>
              <p className="text-xs text-muted-foreground">{t.appSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {route.view === 'phase' && (
              <Button variant="outline" onClick={() => navigate({ view: 'dashboard' })}>
                {t.backToDashboard}
              </Button>
            )}
          </div>
        </div>
      </header>

      {route.view === 'dashboard' ? (
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
                onClick={() => navigate({ view: 'phase', phase: journey.currentPhase })}
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
