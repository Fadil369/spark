import { useState, useEffect } from 'react'
import { Journey, Story, Brand, GeneratedCode } from '@/lib/types'
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

export function BrandPhase({ journey, onComplete }: CompletionPhaseProps) {
  const [step, setStep] = useState<'names' | 'colors' | 'tagline' | 'review'>('names')
  const [isGenerating, setIsGenerating] = useState(false)
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

  const colorPalettes = [
    {
      name: 'Medical Teal',
      primary: 'oklch(0.65 0.12 200)',
      secondary: 'oklch(0.25 0.05 250)',
      accent: 'oklch(0.68 0.20 350)'
    },
    {
      name: 'Clinical Blue',
      primary: 'oklch(0.55 0.15 240)',
      secondary: 'oklch(0.35 0.08 260)',
      accent: 'oklch(0.75 0.18 180)'
    },
    {
      name: 'Health Green',
      primary: 'oklch(0.60 0.14 150)',
      secondary: 'oklch(0.30 0.05 180)',
      accent: 'oklch(0.70 0.16 60)'
    },
    {
      name: 'Care Purple',
      primary: 'oklch(0.58 0.16 290)',
      secondary: 'oklch(0.28 0.06 280)',
      accent: 'oklch(0.72 0.14 340)'
    },
    {
      name: 'Wellness Orange',
      primary: 'oklch(0.68 0.15 40)',
      secondary: 'oklch(0.32 0.06 30)',
      accent: 'oklch(0.75 0.12 200)'
    }
  ]

  const iconOptions = ['Heart', 'Heartbeat', 'FirstAid', 'Pill', 'Stethoscope', 'Hospital', 'Syringe', 'Bandaids']

  useEffect(() => {
    if (journey.brand) {
      setSelectedName(journey.brand.name)
      setSelectedColors(journey.brand.colors)
      setSelectedTagline(journey.brand.tagline)
      setSelectedIcon(journey.brand.logo)
      setStep('review')
    }
  }, [])

  const generateNames = async () => {
    if (!journey.concept) {
      toast.error('No concept found. Please complete brainstorm first.')
      return
    }

    setIsGenerating(true)
    try {
      const prompt = window.spark.llmPrompt`You are a healthcare startup naming expert. Generate 8 unique, memorable startup names based on this concept:

Problem: ${journey.concept.problem}
Target Users: ${journey.concept.targetUsers}
Solution: ${journey.concept.solution}

Generate names that:
- Are 1-2 words
- Sound professional yet approachable
- Work well in healthcare context
- Are memorable and modern
- Mix different styles (portmanteaus, descriptive, abstract, playful)

Return a JSON object with a single property "names" containing an array of exactly 8 name strings.`
      
      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)
      setNameOptions(result.names || [])
      toast.success('Names generated!')
    } catch (error) {
      toast.error('Failed to generate names. Please try again.')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateTaglines = async () => {
    if (!selectedName) {
      toast.error('Please select a name first')
      return
    }

    setIsGenerating(true)
    try {
      const prompt = window.spark.llmPrompt`You are a healthcare marketing expert. Generate 6 powerful taglines for this startup:

Name: ${selectedName}
Problem: ${journey.concept?.problem || ''}
Solution: ${journey.concept?.solution || ''}

Generate taglines that:
- Are 3-6 words
- Are clear and memorable
- Convey value and emotion
- Work for healthcare context
- Vary in style (aspirational, benefit-focused, mission-driven)

Return a JSON object with a single property "taglines" containing an array of exactly 6 tagline strings.`
      
      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)
      setTaglineOptions(result.taglines || [])
      toast.success('Taglines generated!')
    } catch (error) {
      toast.error('Failed to generate taglines. Please try again.')
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
      toast.error('Please complete all brand elements')
      return
    }

    const brand: Brand = {
      name: selectedName,
      tagline: selectedTagline,
      colors: selectedColors,
      logo: selectedIcon,
      timestamp: Date.now()
    }

    const updatedJourney = { ...journey, brand }
    const completedJourney = completePhase(updatedJourney, 'brand')
    
    if (onComplete) {
      onComplete(completedJourney)
    }
    
    toast.success('Brand phase complete! 🎨')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">The Brand Studio</h1>
        <p className="text-lg text-muted-foreground">Create your startup's visual identity</p>
      </div>

      {step === 'names' && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Startup Name</CardTitle>
            <CardDescription>Select a name that resonates with your vision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <Sparkle className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" weight="fill" />
                <p className="text-muted-foreground">Generating unique names...</p>
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
              Regenerate Names
            </Button>
            <Button onClick={() => setStep('colors')} disabled={!selectedName} className="flex-1">
              Continue to Colors
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'colors' && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Color Palette</CardTitle>
            <CardDescription>Select colors that reflect your brand personality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {colorPalettes.map((palette, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColors({
                    primary: palette.primary,
                    secondary: palette.secondary,
                    accent: palette.accent
                  })}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedColors.primary === palette.primary
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-lg mb-2">{palette.name}</div>
                      <div className="flex gap-2">
                        <div className="w-12 h-12 rounded border" style={{ backgroundColor: palette.primary }} />
                        <div className="w-12 h-12 rounded border" style={{ backgroundColor: palette.secondary }} />
                        <div className="w-12 h-12 rounded border" style={{ backgroundColor: palette.accent }} />
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Primary</div>
                      <div>Secondary</div>
                      <div>Accent</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold">Choose Your Icon</label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setSelectedIcon(icon)}
                    className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                      selectedIcon === icon
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl">{icon === 'Heart' ? '❤️' : icon === 'Heartbeat' ? '💓' : icon === 'FirstAid' ? '🩹' : icon === 'Pill' ? '💊' : icon === 'Stethoscope' ? '🩺' : icon === 'Hospital' ? '🏥' : icon === 'Syringe' ? '💉' : '🩹'}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('names')}>
              Back
            </Button>
            <Button onClick={() => setStep('tagline')} className="flex-1">
              Continue to Tagline
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'tagline' && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Tagline</CardTitle>
            <CardDescription>A memorable phrase that captures your mission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isGenerating ? (
              <div className="text-center py-12">
                <Sparkle className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" weight="fill" />
                <p className="text-muted-foreground">Generating taglines...</p>
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
              Back
            </Button>
            <Button variant="outline" onClick={generateTaglines} disabled={isGenerating}>
              <Sparkle className="mr-2" weight="fill" />
              Regenerate Taglines
            </Button>
            <Button onClick={() => setStep('review')} disabled={!selectedTagline} className="flex-1">
              Review Brand
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Brand Identity</CardTitle>
            <CardDescription>Review your complete brand kit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center p-8 rounded-lg" style={{ backgroundColor: selectedColors.primary }}>
              <div className="text-6xl mb-4">
                {selectedIcon === 'Heart' ? '❤️' : selectedIcon === 'Heartbeat' ? '💓' : selectedIcon === 'FirstAid' ? '🩹' : selectedIcon === 'Pill' ? '💊' : selectedIcon === 'Stethoscope' ? '🩺' : selectedIcon === 'Hospital' ? '🏥' : selectedIcon === 'Syringe' ? '💉' : '🩹'}
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">{selectedName}</h2>
              <p className="text-xl text-white/90">{selectedTagline}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-16 h-16 rounded-full mx-auto mb-2" style={{ backgroundColor: selectedColors.primary }} />
                <div className="text-xs text-muted-foreground">Primary</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-16 h-16 rounded-full mx-auto mb-2" style={{ backgroundColor: selectedColors.secondary }} />
                <div className="text-xs text-muted-foreground">Secondary</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-16 h-16 rounded-full mx-auto mb-2" style={{ backgroundColor: selectedColors.accent }} />
                <div className="text-xs text-muted-foreground">Accent</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('names')}>
              Start Over
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Complete Brand Phase
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}



export function CodePhase({ journey, onComplete }: CompletionPhaseProps) {
  const [step, setStep] = useState<'template' | 'generating' | 'preview'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<'landing' | 'webapp' | 'dashboard'>('landing')
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (journey.code) {
      setGeneratedCode(journey.code)
      setSelectedTemplate(journey.code.template)
      setStep('preview')
    }
  }, [])

  const templates = [
    {
      type: 'landing' as const,
      name: 'Landing Page',
      description: 'Single-page marketing site with hero, features, and CTA sections',
      icon: '🌐',
      bestFor: 'Patient-facing products, B2C healthcare services'
    },
    {
      type: 'webapp' as const,
      name: 'Web Application',
      description: 'Multi-page app with navigation, forms, and interactive features',
      icon: '⚡',
      bestFor: 'Patient portals, telemedicine platforms, health tracking'
    },
    {
      type: 'dashboard' as const,
      name: 'Admin Dashboard',
      description: 'Data-rich interface with charts, tables, and management tools',
      icon: '📊',
      bestFor: 'Provider tools, analytics platforms, practice management'
    }
  ]

  const generateCode = async () => {
    if (!journey.prd || !journey.brand) {
      toast.error('Please complete PRD and Brand phases first')
      return
    }

    setIsGenerating(true)
    setStep('generating')

    try {
      const templateInfo = templates.find(t => t.type === selectedTemplate)
      
      const prompt = window.spark.llmPrompt`You are an expert healthcare web developer. Generate a complete code structure for a ${selectedTemplate} based on this information:

Brand Name: ${journey.brand.name}
Tagline: ${journey.brand.tagline}
Problem: ${journey.prd.sections.problem.content}
Solution: ${journey.prd.sections.solution.content}
Target Users: ${journey.prd.sections.targetUsers.content}
Key Features: ${journey.prd.sections.features.content}

Generate a JSON object with a "files" property containing an array of file objects. Each file should have:
- path: relative file path (e.g., "index.html", "app.js", "styles.css")
- content: complete file content

Create a ${templateInfo?.name} with:
- Modern, clean healthcare design
- Responsive layout
- ${selectedTemplate === 'landing' ? 'Hero section, features grid, testimonials, and CTA' : selectedTemplate === 'webapp' ? 'Navigation, dashboard view, forms, and user profile' : 'Sidebar navigation, data visualizations, tables, and filters'}
- Brand colors integrated
- Accessible HTML structure

Include 3-5 files (HTML, CSS, JS as needed). Make the code production-ready and well-commented.`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const result = JSON.parse(response)

      const code: GeneratedCode = {
        template: selectedTemplate,
        files: result.files || [],
        previewUrl: undefined,
        timestamp: Date.now()
      }

      setGeneratedCode(code)
      setStep('preview')
      toast.success('Code generated successfully! 🚀')
    } catch (error) {
      toast.error('Failed to generate code. Please try again.')
      console.error(error)
      setStep('template')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = () => {
    if (!generatedCode) {
      toast.error('Please generate code first')
      return
    }

    const updatedJourney = { ...journey, code: generatedCode }
    const completedJourney = completePhase(updatedJourney, 'code')
    
    if (onComplete) {
      onComplete(completedJourney)
    }
    
    toast.success('Code phase complete! 💻')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">The Code Generator</h1>
        <p className="text-lg text-muted-foreground">Turn your PRD into a working prototype</p>
      </div>

      {step === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Template Type</CardTitle>
            <CardDescription>Select the architecture that best fits your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <button
                key={template.type}
                onClick={() => setSelectedTemplate(template.type)}
                className={`w-full p-6 rounded-lg border-2 transition-all text-left ${
                  selectedTemplate === template.type
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{template.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                    <Badge variant="outline" className="text-xs">
                      Best for: {template.bestFor}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={generateCode} className="w-full" size="lg">
              <Sparkle className="mr-2" weight="fill" />
              Generate Code
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'generating' && (
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Sparkle className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" weight="fill" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Generating Your Code...</h3>
              <p className="text-muted-foreground">Building your {templates.find(t => t.type === selectedTemplate)?.name}</p>
            </div>
            <div className="max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>✓ Analyzing your PRD</p>
              <p>✓ Integrating brand identity</p>
              <p>✓ Structuring components</p>
              <p className="animate-pulse">⏳ Generating code files...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && generatedCode && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Code Structure</CardTitle>
              <CardDescription>
                {generatedCode.files.length} files generated for your {templates.find(t => t.type === selectedTemplate)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {generatedCode.files.map((file, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 font-mono text-sm font-semibold flex items-center justify-between">
                      <span>{file.path}</span>
                      <Badge variant="secondary" className="text-xs">
                        {file.content.split('\n').length} lines
                      </Badge>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <pre className="p-4 text-xs font-mono bg-background">
                        <code>{file.content}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                ))}
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold mb-1">Ready for Development</p>
                    <p className="text-muted-foreground">
                      These files provide a starting point. Customize them with your specific logic, integrate with backend services, and add security features before deploying to production.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('template')}>
                Generate Different Template
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Complete Code Phase
                <ArrowRight className="ml-2" weight="bold" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
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
