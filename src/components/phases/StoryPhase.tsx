import { useState, useEffect } from 'react'
import { Journey, Story } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkle, Brain, Package } from '@phosphor-icons/react'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { successToast } from '@/lib/toastWithLogo'
import { completePhase } from '@/lib/game'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import { useLanguage } from '@/contexts/LanguageContext'
import { createAIHelper } from '@/lib/aiHelper'

interface StoryPhaseProps {
  journey: Journey
  onComplete?: (updatedJourney: Journey) => void
}

export function StoryPhase({ journey, onComplete }: StoryPhaseProps) {
  const [step, setStep] = useState<'template' | 'fill' | 'generate' | 'review'>('template')
  const [tone, setTone] = useState<'empathetic' | 'scientific'>('empathetic')
  const [formData, setFormData] = useState({
    targetPatient: '',
    coreProblem: '',
    impact: '',
    solutionVision: ''
  })
  const [generatedNarrative, setGeneratedNarrative] = useState('')
  const [aiScore, setAiScore] = useState<{ clarity: number; emotion: number; healthcare: number } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const { language, t } = useLanguage()
  const st = t.story

  useEffect(() => {
    if (journey.story) {
      setFormData({
        targetPatient: journey.story.targetPatient,
        coreProblem: journey.story.coreProblem,
        impact: journey.story.impact,
        solutionVision: journey.story.solutionVision
      })
      setGeneratedNarrative(journey.story.narrative)
      setTone(journey.story.tone)
      setAiScore(journey.story.aiScore || null)
      setStep('review')
    }
  }, [])

  const handleGenerateNarrative = async () => {
    if (!formData.targetPatient || !formData.coreProblem || !formData.impact || !formData.solutionVision) {
      toast.error(tt.fillAllFields)
      return
    }

    setIsGenerating(true)
    try {
      const aiHelper = createAIHelper(language)
      
      const narrative = await aiHelper.generateFounderStory({
        problem: journey.concept?.problem || '',
        targetUsers: journey.concept?.targetUsers || '',
        solution: journey.concept?.solution || '',
        tone,
        targetPatient: formData.targetPatient,
        coreProblem: formData.coreProblem,
        realWorldImpact: formData.impact,
        solutionVision: formData.solutionVision
      })
      
      if (!narrative || narrative.trim().length === 0) {
        throw new Error('AI returned empty response for story generation')
      }

      setGeneratedNarrative(narrative.trim())
      
      await scoreNarrative(narrative)
      
      setStep('review')
      toast.success(tt.storyGenerated)
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred'
      toast.error(`${tt.storyFailed}: ${errorMessage}`)
      console.error('[Story Generation Error]', {
        error: errorMessage,
        formData,
        tone,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const scoreNarrative = async (narrative: string) => {
    try {
      const aiHelper = createAIHelper(language)
      const scores = await aiHelper.scoreStory(narrative)
      setAiScore(scores)
    } catch (error) {
      console.error('Failed to score narrative:', error)
    }
  }

  const handleComplete = () => {
    const story: Story = {
      narrative: generatedNarrative,
      tone,
      targetPatient: formData.targetPatient,
      coreProblem: formData.coreProblem,
      impact: formData.impact,
      solutionVision: formData.solutionVision,
      aiScore: aiScore || undefined,
      timestamp: Date.now()
    }

    const updatedJourney = { ...journey, story }
    const completedJourney = completePhase(updatedJourney, 'story')
    
    if (onComplete) {
      onComplete(completedJourney)
    }
    
    successToast(tt.phaseComplete + ' 🎉')
  }

  const handleImproveStory = async () => {
    if (!generatedNarrative || generatedNarrative.trim().length === 0) {
      toast.error(tt.generateStoryFirst)
      return
    }

    setIsGenerating(true)
    try {
      const aiHelper = createAIHelper(language)
      
      const improvements = []
      if (aiScore && aiScore.clarity < 70) improvements.push(st.clearerVision)
      if (aiScore && aiScore.emotion < 70) improvements.push(st.moreEmotional)
      if (aiScore && aiScore.healthcare < 70) improvements.push(st.strongerImpact)
      if (improvements.length === 0) improvements.push(st.betterFlow, st.strongerImpact)
      
      const improved = await aiHelper.improveStory(generatedNarrative, improvements)
      
      if (!improved || improved.trim().length === 0) {
        throw new Error('AI returned empty response for story improvement')
      }

      setGeneratedNarrative(improved.trim())
      await scoreNarrative(improved)
      
      successToast(st.storyImproved)
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred'
      toast.error(`${tt.storyImproveFailed}: ${errorMessage}`)
      console.error('[Story Improvement Error]', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTranslateStory = async () => {
    if (!generatedNarrative || generatedNarrative.trim().length === 0) {
      toast.error(tt.generateStoryFirst)
      return
    }

    setIsGenerating(true)
    try {
      const aiHelper = createAIHelper(language)
      const targetLanguage = language === 'ar' ? 'en' : 'ar'
      
      const translated = await aiHelper.translateStory(generatedNarrative, targetLanguage)
      
      if (!translated || translated.trim().length === 0) {
        throw new Error('AI returned empty response for story translation')
      }

      setGeneratedNarrative(translated.trim())
      
      successToast(st.storyTranslated)
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred'
      toast.error(`${tt.storyTranslateFailed}: ${errorMessage}`)
      console.error('[Story Translation Error]', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportPDF = async () => {
    if (!generatedNarrative || generatedNarrative.trim().length === 0) {
      toast.error(tt.generateStoryFirst)
      return
    }

    try {
      const { exportStoryToPDF } = await import('@/lib/prdExport')
      
      exportStoryToPDF(generatedNarrative, {
        brandName: journey.brand?.name,
        tone: tone,
        targetPatient: formData.targetPatient,
        coreProblem: formData.coreProblem,
        impact: formData.impact,
        solutionVision: formData.solutionVision,
        aiScore: aiScore || undefined,
        colors: journey.brand?.colors,
        language: language,
        isRTL: language === 'ar'
      })
      
      successToast(st.pdfExported)
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred'
      toast.error(st.pdfExportFailed)
      console.error('[PDF Export Error]', {
        error: errorMessage,
        timestamp: new Date().toISOString()
      })
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return st.excellent
    if (score >= 60) return st.good
    return st.needsWork
  }

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold font-heading">{st.title}</h1>
          <p className="text-lg text-muted-foreground">{st.subtitle}</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <AILoadingScreen
              isVisible={true}
              language={language}
              message={language === 'ar' ? 'جارٍ توليد قصتك...' : 'Crafting your founder story...'}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">{st.title}</h1>
        <p className="text-lg text-muted-foreground">{st.subtitle}</p>
      </div>

      {journey.concept && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">{st.yourConcept}</p>
            <p className="text-foreground">{journey.concept.problem}</p>
          </CardContent>
        </Card>
      )}

      {step === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle>{st.chooseStoryTone}</CardTitle>
            <CardDescription>{st.selectNarrativeStyle}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setTone('empathetic')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  tone === 'empathetic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">{st.empathetic}</h3>
                <p className="text-sm text-muted-foreground">
                  {st.empatheticDesc}
                </p>
              </button>
              <button
                onClick={() => setTone('scientific')}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  tone === 'scientific'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">{st.scientific}</h3>
                <p className="text-sm text-muted-foreground">
                  {st.scientificDesc}
                </p>
              </button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setStep('fill')} className="w-full">
              {st.continueToElements}
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'fill' && (
        <Card>
          <CardHeader>
            <CardTitle>{st.fillStoryElements}</CardTitle>
            <CardDescription>
              {st.fillElementsSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">{st.targetPatient}</label>
              <Textarea
                id="target-patient"
                placeholder={st.targetPatientPlaceholder}
                value={formData.targetPatient}
                onChange={(e) => setFormData({ ...formData, targetPatient: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{st.coreProblem}</label>
              <Textarea
                id="core-problem"
                placeholder={st.coreProblemPlaceholder}
                value={formData.coreProblem}
                onChange={(e) => setFormData({ ...formData, coreProblem: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{st.realWorldImpact}</label>
              <Textarea
                id="impact"
                placeholder={st.realWorldImpactPlaceholder}
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{st.solutionVision}</label>
              <Textarea
                id="solution-vision"
                placeholder={st.solutionVisionPlaceholder}
                value={formData.solutionVision}
                onChange={(e) => setFormData({ ...formData, solutionVision: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold">{st.adjustTone}</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-24">{st.empathetic}</span>
                <Slider
                  value={[tone === 'empathetic' ? 0 : 100]}
                  onValueChange={(value) => setTone(value[0] < 50 ? 'empathetic' : 'scientific')}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-24 text-right">{st.scientific}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('template')}>
              {t.back}
            </Button>
            <Button onClick={handleGenerateNarrative} disabled={isGenerating} className="flex-1">
              <Sparkle className="mr-2" weight="fill" />
              {st.generateStory}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{st.yourFounderStory}</CardTitle>
              <CardDescription>{st.reviewEdit}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScrollArea className="h-[400px] rounded-lg border p-4">
                <Textarea
                  value={generatedNarrative}
                  onChange={(e) => setGeneratedNarrative(e.target.value)}
                  className="min-h-[350px] border-0 focus-visible:ring-0 resize-none"
                />
              </ScrollArea>

              {aiScore && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">{st.aiStoryScore}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className={`text-3xl font-bold ${getScoreColor(aiScore.clarity)}`}>
                        {aiScore.clarity}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{st.clarity}</div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {getScoreLabel(aiScore.clarity)}
                      </Badge>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className={`text-3xl font-bold ${getScoreColor(aiScore.emotion)}`}>
                        {aiScore.emotion}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{st.emotion}</div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {getScoreLabel(aiScore.emotion)}
                      </Badge>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className={`text-3xl font-bold ${getScoreColor(aiScore.healthcare)}`}>
                        {aiScore.healthcare}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{st.healthcare}</div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {getScoreLabel(aiScore.healthcare)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('fill')}>
                {st.editInputs}
              </Button>
              <Button variant="outline" onClick={handleGenerateNarrative} disabled={isGenerating}>
                <Sparkle className="mr-2" weight="fill" />
                {st.regenerate}
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                {st.completeStory}
                <ArrowRight className="ml-2" weight="bold" />
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{st.additionalTools}</CardTitle>
              <CardDescription>
                {st.additionalToolsDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleImproveStory}
                  disabled={isGenerating}
                  className="flex-1 min-w-[180px]"
                >
                  <Brain className="mr-2" weight="bold" />
                  {st.improveStory}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleTranslateStory}
                  disabled={isGenerating}
                  className="flex-1 min-w-[180px]"
                >
                  <Sparkle className="mr-2" weight="bold" />
                  {language === 'ar' ? st.translateToEnglish : st.translateToArabic}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleExportPDF}
                  className="flex-1 min-w-[180px]"
                >
                  <Package className="mr-2" weight="bold" />
                  {st.exportPDF}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
