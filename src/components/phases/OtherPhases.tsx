import { useState, useEffect } from 'react'
import { Journey, Story } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { completePhase } from '@/lib/game'

interface CompletionPhaseProps {
  journey: Journey
  onComplete?: (updatedJourney: Journey) => void
}

export function StoryPhase({ journey, onComplete }: CompletionPhaseProps) {
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
      toast.error('Please fill in all fields before generating')
      return
    }

    setIsGenerating(true)
    try {
      const toneDescription = tone === 'empathetic' 
        ? 'warm, compassionate, and emotionally resonant' 
        : 'data-driven, analytical, and evidence-based'

      const prompt = window.spark.llmPrompt`You are a healthcare startup storytelling expert. Create a compelling founder narrative based on these elements:

Target Patient: ${formData.targetPatient}
Core Problem: ${formData.coreProblem}
Impact: ${formData.impact}
Solution Vision: ${formData.solutionVision}

The tone should be ${toneDescription}.

Write a 3-4 paragraph founder story that:
1. Opens with the human impact of the problem
2. Explains why this matters in healthcare
3. Presents the solution vision with conviction
4. Ends with a call to action or inspiring vision

Make it authentic, specific to healthcare, and compelling. Return only the narrative text, no JSON.`
      
      const narrative = await window.spark.llm(prompt, 'gpt-4o')
      setGeneratedNarrative(narrative.trim())
      
      await scoreNarrative(narrative)
      
      setStep('review')
      toast.success('Your founder story has been generated!')
    } catch (error) {
      toast.error('Failed to generate narrative. Please try again.')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const scoreNarrative = async (narrative: string) => {
    try {
      const prompt = window.spark.llmPrompt`You are evaluating a healthcare startup founder story. Rate it on three dimensions (0-100):

Story to evaluate:
"${narrative}"

Return a JSON object with:
- clarity: How clear and understandable is the problem and solution? (0-100)
- emotion: How emotionally compelling and human-centered is it? (0-100)
- healthcare: How specific and credible is it for healthcare context? (0-100)

Only return the JSON object with these three numeric scores.`
      
      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const scores = JSON.parse(response)
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
    
    toast.success('Story phase complete! 🎉')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Work'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">The Story Builder</h1>
        <p className="text-lg text-muted-foreground">Transform your concept into a compelling founder narrative</p>
      </div>

      {journey.concept && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Your Concept</p>
            <p className="text-foreground">{journey.concept.problem}</p>
          </CardContent>
        </Card>
      )}

      {step === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Story Tone</CardTitle>
            <CardDescription>Select the narrative style that fits your vision</CardDescription>
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
                <h3 className="font-semibold text-lg mb-2">Empathetic</h3>
                <p className="text-sm text-muted-foreground">
                  Warm, human-centered storytelling that emphasizes patient experiences and emotional impact
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
                <h3 className="font-semibold text-lg mb-2">Scientific</h3>
                <p className="text-sm text-muted-foreground">
                  Data-driven narrative focusing on evidence, clinical outcomes, and systemic solutions
                </p>
              </button>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setStep('fill')} className="w-full">
              Continue to Story Elements
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'fill' && (
        <Card>
          <CardHeader>
            <CardTitle>Fill in Your Story Elements</CardTitle>
            <CardDescription>
              Answer these prompts to build your founder narrative
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Who is the patient or person affected?</label>
              <Textarea
                id="target-patient"
                placeholder="e.g., elderly patients managing multiple chronic conditions, busy working parents..."
                value={formData.targetPatient}
                onChange={(e) => setFormData({ ...formData, targetPatient: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">What is the core healthcare problem?</label>
              <Textarea
                id="core-problem"
                placeholder="e.g., medication non-adherence leads to 125,000 deaths annually and costs $300B..."
                value={formData.coreProblem}
                onChange={(e) => setFormData({ ...formData, coreProblem: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">What is the real-world impact?</label>
              <Textarea
                id="impact"
                placeholder="e.g., preventable hospital readmissions, caregiver burnout, quality of life..."
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">What is your solution vision?</label>
              <Textarea
                id="solution-vision"
                placeholder="e.g., an AI-powered companion that makes medication management feel like having a caring nurse..."
                value={formData.solutionVision}
                onChange={(e) => setFormData({ ...formData, solutionVision: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold">Adjust Narrative Tone</label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-24">Empathetic</span>
                <Slider
                  value={[tone === 'empathetic' ? 0 : 100]}
                  onValueChange={(value) => setTone(value[0] < 50 ? 'empathetic' : 'scientific')}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground w-24 text-right">Scientific</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('template')}>
              Back
            </Button>
            <Button onClick={handleGenerateNarrative} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>Generating your story...</>
              ) : (
                <>
                  <Sparkle className="mr-2" weight="fill" />
                  Generate Founder Story
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Founder Story</CardTitle>
              <CardDescription>Review and edit your generated narrative</CardDescription>
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
                  <p className="text-sm font-semibold">AI Story Quality Score</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className={`text-3xl font-bold ${getScoreColor(aiScore.clarity)}`}>
                        {aiScore.clarity}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Clarity</div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {getScoreLabel(aiScore.clarity)}
                      </Badge>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className={`text-3xl font-bold ${getScoreColor(aiScore.emotion)}`}>
                        {aiScore.emotion}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Emotion</div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {getScoreLabel(aiScore.emotion)}
                      </Badge>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className={`text-3xl font-bold ${getScoreColor(aiScore.healthcare)}`}>
                        {aiScore.healthcare}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Healthcare</div>
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
                Edit Inputs
              </Button>
              <Button variant="outline" onClick={handleGenerateNarrative} disabled={isGenerating}>
                <Sparkle className="mr-2" weight="fill" />
                Regenerate
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Complete Story Phase
                <ArrowRight className="ml-2" weight="bold" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

export function BrandPhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Brand Phase - Coming Soon</CardTitle>
          <CardDescription>Generate name, tagline, and visual identity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Create your brand identity</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function PRDPhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>PRD Phase - Coming Soon</CardTitle>
          <CardDescription>Build a functional product requirements document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Document your product requirements</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function CodePhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Code Phase - Coming Soon</CardTitle>
          <CardDescription>Turn your PRD into a runnable MVP scaffold</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Generate your code</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function GitHubPhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎉</div>
        <h1 className="text-4xl font-bold font-heading">Congratulations!</h1>
        <p className="text-lg text-muted-foreground">
          You've completed your healthcare startup journey
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Journey Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {journey.concept && (
            <div>
              <h3 className="font-semibold mb-2">Concept</h3>
              <p className="text-sm text-muted-foreground">{journey.concept.problem}</p>
            </div>
          )}
          <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
            <Sparkle weight="fill" className="text-primary" />
            <div>
              <div className="font-semibold">Level {journey.gameState.level} Founder</div>
              <div className="text-sm text-muted-foreground">
                {journey.gameState.xp} XP earned
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
