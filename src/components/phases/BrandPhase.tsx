import { useState, useEffect } from 'react'
import { Journey, Brand, BrandPersonality } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { completePhase } from '@/lib/game'
import { createAIHelper } from '@/lib/aiHelper'
import { useLanguage } from '@/contexts/LanguageContext'
import { BrandQuiz } from './brand/BrandQuiz'
import { BrandColors } from './brand/BrandColors'
import { BrandReview } from './brand/BrandReview'

interface BrandPhaseProps {
  journey: Journey
  onComplete?: (updatedJourney: Journey) => void
}

export function BrandPhase({ journey, onComplete }: BrandPhaseProps) {
  const [step, setStep] = useState<'quiz' | 'names' | 'colors' | 'tagline' | 'review'>('quiz')
  const [isGenerating, setIsGenerating] = useState(false)
  const [brandPersonality, setBrandPersonality] = useState<BrandPersonality | null>(null)
  const [nameOptions, setNameOptions] = useState<string[]>([])
  const [selectedName, setSelectedName] = useState('')
  const [selectedColors, setSelectedColors] = useState({
    primary: 'oklch(0.65 0.12 200)',
    secondary: 'oklch(0.25 0.05 250)',
    accent: 'oklch(0.68 0.20 350)'
  })
  const [taglineOptions, setTaglineOptions] = useState<string[]>([])
  const [selectedTagline, setSelectedTagline] = useState('')
  const [selectedIcon, setSelectedIcon] = useState('Heart')
  
  const { language, t } = useLanguage()
  const bt = t.brand
  const tt = t.toast

  useEffect(() => {
    if (journey.brand) {
      setSelectedName(journey.brand.name)
      setSelectedColors(journey.brand.colors)
      setSelectedTagline(journey.brand.tagline)
      setSelectedIcon(journey.brand.logo)
      setBrandPersonality(journey.brand.personality || null)
      setStep('review')
    }
  }, [])

  const handleQuizComplete = (personality: BrandPersonality) => {
    setBrandPersonality(personality)
    setStep('names')
  }

  const generateNames = async () => {
    if (!journey.concept) {
      toast.error(tt.noConceptFound)
      return
    }

    setIsGenerating(true)
    try {
      const aiHelper = createAIHelper(language)
      const conceptStr = `${journey.concept.problem} - ${journey.concept.targetUsers} - ${journey.concept.solution}`
      
      const names = brandPersonality 
        ? await aiHelper.generateBrandName(brandPersonality, conceptStr)
        : await aiHelper.generateBrandName({
            archetype: 'Caregiver',
            tone: ['professional', 'empathetic'],
            values: ['trust', 'care'],
            targetFeeling: 'secure and supported'
          }, conceptStr)
      
      setNameOptions(names)
      toast.success(tt.namesGenerated)
    } catch (error) {
      toast.error(tt.namesFailed)
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateTaglines = async () => {
    if (!selectedName) {
      toast.error(tt.selectNameFirst)
      return
    }

    setIsGenerating(true)
    try {
      const aiHelper = createAIHelper(language)
      const conceptStr = `${journey.concept?.problem || ''} - ${journey.concept?.solution || ''}`
      
      const taglines = await aiHelper.generateTaglines(selectedName, conceptStr)
      setTaglineOptions(taglines)
      toast.success(tt.taglinesGenerated)
    } catch (error) {
      toast.error(tt.taglinesFailed)
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (step === 'names' && nameOptions.length === 0) {
      generateNames()
    }
  }, [step])

  useEffect(() => {
    if (step === 'tagline' && taglineOptions.length === 0) {
      generateTaglines()
    }
  }, [step])

  const handleComplete = () => {
    if (!selectedName || !selectedTagline) {
      toast.error(bt.completeAllElements)
      return
    }

    const brand: Brand = {
      name: selectedName,
      tagline: selectedTagline,
      colors: selectedColors,
      logo: selectedIcon,
      personality: brandPersonality || undefined,
      timestamp: Date.now()
    }

    const updatedJourney = { ...journey, brand }
    const completedJourney = completePhase(updatedJourney, 'brand')
    
    if (onComplete) {
      onComplete(completedJourney)
    }
    
    toast.success(bt.phaseComplete)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">{bt.title}</h1>
        <p className="text-lg text-muted-foreground">{bt.subtitle}</p>
      </div>

      {step === 'quiz' && (
        <BrandQuiz 
          onComplete={handleQuizComplete}
          conceptData={{
            problem: journey.concept?.problem,
            targetUsers: journey.concept?.targetUsers,
            solution: journey.concept?.solution
          }}
        />
      )}

      {step === 'names' && brandPersonality && (
        <Card className="bg-accent/10 border-accent/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkle className="w-6 h-6 text-accent" weight="fill" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">{bt.yourBrandPersonality}: {String(brandPersonality.archetype || '')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{String(brandPersonality.targetFeeling || '')}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(brandPersonality.tone) && brandPersonality.tone.map((tone, idx) => (
                    <Badge key={`${tone}-${idx}`} variant="secondary" className="capitalize">
                      {String(tone)}
                    </Badge>
                  ))}
                  {Array.isArray(brandPersonality.values) && brandPersonality.values.map((value, idx) => (
                    <Badge key={`${value}-${idx}`} variant="outline" className="capitalize">
                      {String(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'names' && (
        <Card>
          <CardHeader>
            <CardTitle>{bt.chooseName}</CardTitle>
            <CardDescription>{bt.chooseNameDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <Sparkle className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" weight="fill" />
                <p className="text-muted-foreground">{bt.generatingNames}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nameOptions.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedName(name)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedName === name
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold text-lg">{name}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={generateNames} disabled={isGenerating}>
              <Sparkle className="mr-2" weight="fill" />
              {bt.regenerateNames}
            </Button>
            <Button onClick={() => setStep('colors')} disabled={!selectedName} className="flex-1">
              {bt.continueToColors}
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'colors' && (
        <BrandColors
          selectedColors={selectedColors}
          selectedIcon={selectedIcon}
          onColorsChange={setSelectedColors}
          onIconChange={setSelectedIcon}
          onBack={() => setStep('names')}
          onContinue={() => setStep('tagline')}
        />
      )}

      {step === 'tagline' && (
        <Card>
          <CardHeader>
            <CardTitle>{bt.chooseTagline}</CardTitle>
            <CardDescription>{bt.taglineDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <Sparkle className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" weight="fill" />
                <p className="text-muted-foreground">{bt.generatingTaglines}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {taglineOptions.map((tagline, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedTagline(tagline)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedTagline === tagline
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium text-lg">{tagline}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('colors')}>
              {bt.back}
            </Button>
            <Button variant="outline" onClick={generateTaglines} disabled={isGenerating}>
              <Sparkle className="mr-2" weight="fill" />
              {bt.regenerateTaglines}
            </Button>
            <Button onClick={() => setStep('review')} disabled={!selectedTagline} className="flex-1">
              {bt.reviewBrand}
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'review' && (
        <BrandReview
          selectedName={selectedName}
          selectedTagline={selectedTagline}
          selectedColors={selectedColors}
          selectedIcon={selectedIcon}
          onStartOver={() => setStep('names')}
          onComplete={handleComplete}
        />
      )}
    </div>
  )
}
