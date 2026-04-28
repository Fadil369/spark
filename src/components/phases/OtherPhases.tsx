import { useState, useEffect } from 'react'
import { Journey, Story, Brand, BrandPersonality, GeneratedCode } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkle, Brain, Heart, Rocket, Shield, Target, Users, Check, Code, ListChecks, GitBranch, Package, CheckCircle } from '@phosphor-icons/react'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { successToast } from '@/lib/toastWithLogo'
import { completePhase } from '@/lib/game'
import { Progress } from '@/components/ui/progress'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import { useLanguage } from '@/contexts/LanguageContext'
import { LiveCodePreview } from '@/components/LiveCodePreview'
import { DeploymentInstructions } from '@/components/DeploymentInstructions'
import { getFrameworkBestPractices, getTemplateArchitecture, type FrameworkType, type TemplateType } from '@/lib/frameworkBestPractices'
import { createAIHelper } from '@/lib/aiHelper'

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
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول قبل التوليد' : 'Please fill in all fields before generating')
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
      toast.success(language === 'ar' ? 'تم توليد قصة المؤسس!' : 'Your founder story has been generated!')
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred'
      toast.error(language === 'ar' ? `فشل توليد القصة: ${errorMessage}` : `Story generation failed: ${errorMessage}`)
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
    
    toast.success(language === 'ar' ? 'مرحلة القصة مكتملة! 🎉' : 'Story phase complete! 🎉')
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
                placeholder="e.g., elderly patients managing multiple chronic conditions, busy working parents..."
                value={formData.targetPatient}
                onChange={(e) => setFormData({ ...formData, targetPatient: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{st.coreProblem}</label>
              <Textarea
                id="core-problem"
                placeholder="e.g., medication non-adherence leads to 125,000 deaths annually and costs $300B..."
                value={formData.coreProblem}
                onChange={(e) => setFormData({ ...formData, coreProblem: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{st.realWorldImpact}</label>
              <Textarea
                id="impact"
                placeholder="e.g., preventable hospital readmissions, caregiver burnout, quality of life..."
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{st.solutionVision}</label>
              <Textarea
                id="solution-vision"
                placeholder="e.g., an AI-powered companion that makes medication management feel like having a caring nurse..."
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
        </div>
      )}
    </div>
  )
}

export function BrandPhase({ journey, onComplete }: CompletionPhaseProps) {
  const [step, setStep] = useState<'quiz' | 'analyzing' | 'names' | 'colors' | 'tagline' | 'review'>('quiz')
  const [isGenerating, setIsGenerating] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
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
  
  const quizQuestions = [
    {
      id: 'archetype',
      question: 'How would you describe your healthcare startup\'s primary mission?',
      icon: Target,
      options: [
        { value: 'caregiver', label: 'Caregiver', description: 'Nurturing and protecting patients with empathy' },
        { value: 'innovator', label: 'Innovator', description: 'Pioneering breakthrough medical solutions' },
        { value: 'hero', label: 'Hero', description: 'Tackling critical healthcare challenges courageously' },
        { value: 'sage', label: 'Sage', description: 'Providing knowledge and medical expertise' }
      ]
    },
    {
      id: 'tone',
      question: 'What tone should your brand convey to patients and providers?',
      icon: Heart,
      options: [
        { value: 'warm-compassionate', label: 'Warm & Compassionate', description: 'Friendly, caring, emotionally supportive' },
        { value: 'professional-authoritative', label: 'Professional & Authoritative', description: 'Expert, credible, clinical precision' },
        { value: 'innovative-forward', label: 'Innovative & Forward-thinking', description: 'Cutting-edge, modern, tech-savvy' },
        { value: 'accessible-simple', label: 'Accessible & Simple', description: 'Clear, straightforward, easy to understand' }
      ]
    },
    {
      id: 'values',
      question: 'Which core values matter most to your startup?',
      icon: Shield,
      options: [
        { value: 'trust-safety', label: 'Trust & Safety', description: 'Security, reliability, patient protection' },
        { value: 'innovation-progress', label: 'Innovation & Progress', description: 'Advancement, breakthroughs, future-focused' },
        { value: 'accessibility-inclusion', label: 'Accessibility & Inclusion', description: 'Universal access, equity, affordability' },
        { value: 'excellence-quality', label: 'Excellence & Quality', description: 'High standards, precision, superior care' }
      ]
    },
    {
      id: 'feeling',
      question: 'When patients interact with your brand, they should feel...',
      icon: Heart,
      options: [
        { value: 'comforted-secure', label: 'Comforted & Secure', description: 'Safe, supported, in good hands' },
        { value: 'empowered-informed', label: 'Empowered & Informed', description: 'Knowledgeable, in control, confident' },
        { value: 'hopeful-optimistic', label: 'Hopeful & Optimistic', description: 'Encouraged, positive about outcomes' },
        { value: 'understood-valued', label: 'Understood & Valued', description: 'Heard, respected, personally cared for' }
      ]
    },
    {
      id: 'colors',
      question: 'Which color direction resonates with your vision?',
      icon: Sparkle,
      options: [
        { value: 'cool-calming', label: 'Cool & Calming', description: 'Blues, teals, purples - trust and tranquility' },
        { value: 'warm-energetic', label: 'Warm & Energetic', description: 'Oranges, corals, reds - vitality and warmth' },
        { value: 'natural-balanced', label: 'Natural & Balanced', description: 'Greens, earth tones - health and harmony' },
        { value: 'vibrant-modern', label: 'Vibrant & Modern', description: 'Bold, saturated colors - innovation and confidence' }
      ]
    },
    {
      id: 'style',
      question: 'What visual style best represents your startup?',
      icon: Rocket,
      options: [
        { value: 'medical-clinical', label: 'Medical & Clinical', description: 'Clean, precise, professional healthcare aesthetic' },
        { value: 'tech-modern', label: 'Tech & Modern', description: 'Sleek, digital-first, contemporary design' },
        { value: 'warm-human', label: 'Warm & Human-Centered', description: 'Approachable, friendly, personal touch' },
        { value: 'bold-distinctive', label: 'Bold & Distinctive', description: 'Unique, memorable, stands out from traditional healthcare' }
      ]
    }
  ]

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }))
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const analyzePersonality = async () => {
    setIsGenerating(true)
    setStep('analyzing')
    
    try {
      const prompt = window.spark.llmPrompt`You are a brand personality expert specializing in healthcare startups. Analyze these quiz responses and create a detailed brand personality profile:

Quiz Responses:
${Object.entries(quizAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Healthcare Context:
Problem: ${journey.concept?.problem || ''}
Target Users: ${journey.concept?.targetUsers || ''}
Solution: ${journey.concept?.solution || ''}

Generate a JSON object with:
- archetype: A single-word brand archetype (e.g., "Caregiver", "Innovator", "Hero", "Sage")
- tone: Array of 3 tone descriptors (e.g., ["professional", "empathetic", "innovative"])
- values: Array of 3 core brand values (e.g., ["trust", "accessibility", "excellence"])
- targetFeeling: Single sentence describing the emotional response patients should have
- colorPreference: Recommended color direction ("cool-calming", "warm-energetic", "natural-balanced", or "vibrant-modern")
- styleDirection: Recommended visual style ("medical-clinical", "tech-modern", "warm-human", or "bold-distinctive")

Base your recommendations on the quiz responses and ensure they align with healthcare credibility.`
      
      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const personality = JSON.parse(response)
      setBrandPersonality(personality)
      
      toast.success('Brand personality analyzed!')
      setStep('names')
    } catch (error) {
      toast.error('Failed to analyze personality. Please try again.')
      console.error(error)
      setStep('quiz')
    } finally {
      setIsGenerating(false)
    }
  }

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
      toast.error(language === 'ar' ? 'لا يوجد مفهوم. يرجى إكمال العصف الذهني أولاً.' : 'No concept found. Please complete brainstorm first.')
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
      toast.success(language === 'ar' ? 'تم توليد الأسماء!' : 'Names generated!')
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل توليد الأسماء. يرجى المحاولة مجدداً.' : 'Failed to generate names. Please try again.')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateTaglines = async () => {
    if (!selectedName) {
      toast.error(language === 'ar' ? 'يرجى اختيار اسم أولاً' : 'Please select a name first')
      return
    }

    setIsGenerating(true)
    try {
      const aiHelper = createAIHelper(language)
      const conceptStr = `${journey.concept?.problem || ''} - ${journey.concept?.solution || ''}`
      
      const taglines = await aiHelper.generateTaglines(selectedName, conceptStr)
      setTaglineOptions(taglines)
      toast.success(language === 'ar' ? 'تم توليد الشعارات!' : 'Taglines generated!')
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل توليد الشعارات. يرجى المحاولة مجدداً.' : 'Failed to generate taglines. Please try again.')
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
      personality: brandPersonality || undefined,
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

      {step === 'quiz' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain weight="fill" className="text-primary" />
              Brand Personality Quiz
            </CardTitle>
            <CardDescription>
              Answer {quizQuestions.length} questions to discover your brand's unique personality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                <span>{Math.round(((currentQuestion + (quizAnswers[quizQuestions[currentQuestion].id] ? 1 : 0)) / quizQuestions.length) * 100)}% Complete</span>
              </div>
              <Progress value={(Object.keys(quizAnswers).length / quizQuestions.length) * 100} className="h-2" />
            </div>

            {quizQuestions.map((q, idx) => {
              const QuestionIcon = q.icon
              return idx === currentQuestion ? (
                <div key={q.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <QuestionIcon className="w-6 h-6 text-primary" weight="fill" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-4">{q.question}</h3>
                      <div className="space-y-3">
                        {q.options.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleQuizAnswer(q.id, option.value)}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left hover:border-primary/70 ${
                              quizAnswers[q.id] === option.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border'
                            }`}
                          >
                            <div className="font-medium mb-1">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null
            })}
          </CardContent>
          <CardFooter className="flex gap-3">
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
              >
                Previous
              </Button>
            )}
            {Object.keys(quizAnswers).length === quizQuestions.length && (
              <Button
                onClick={analyzePersonality}
                disabled={isGenerating}
                className="flex-1"
              >
                <Brain className="mr-2" weight="fill" />
                Analyze My Brand Personality
              </Button>
            )}
          </CardFooter>
        </Card>
      )}

      {step === 'analyzing' && (
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Brain className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" weight="fill" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Analyzing Your Brand Personality...</h3>
              <p className="text-muted-foreground">Understanding your values, tone, and style preferences</p>
            </div>
            <div className="max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>✓ Processing quiz responses</p>
              <p>✓ Mapping to healthcare archetypes</p>
              <p>✓ Identifying tone and values</p>
              <p className="animate-pulse">⏳ Creating personality profile...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'names' && brandPersonality && (
        <Card className="bg-accent/10 border-accent/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkle className="w-6 h-6 text-accent" weight="fill" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Your Brand Personality: {String(brandPersonality.archetype || '')}</h3>
                <p className="text-sm text-muted-foreground mb-3">{String(brandPersonality.targetFeeling || '')}</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(brandPersonality.tone) && brandPersonality.tone.map((t, idx) => (
                    <Badge key={`${t}-${idx}`} variant="secondary" className="capitalize">
                      {String(t)}
                    </Badge>
                  ))}
                  {Array.isArray(brandPersonality.values) && brandPersonality.values.map((v, idx) => (
                    <Badge key={`${v}-${idx}`} variant="outline" className="capitalize">
                      {String(v)}
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



interface GeneratedFileEntry {
  path: string
  content: string
}

interface GeneratedFilesResponse {
  files: GeneratedFileEntry[]
}

const MAX_GENERATED_FILES = 3

function safeJsonParse(response: string): GeneratedFilesResponse {
  let text = response.trim()
  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  if (fenceMatch) {
    text = fenceMatch[1].trim()
  } else {
    const innerFence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (innerFence) {
      text = innerFence[1].trim()
    }
  }
  try {
    return JSON.parse(text) as GeneratedFilesResponse
  } catch (err) {
    const msg = (err as Error).message
    // Provide a specific hint when the JSON string was cut off mid-content
    const hint = /unterminated string|unexpected end|unexpected token/i.test(msg)
      ? 'The AI response was likely truncated (hit output token limit).'
      : 'The AI response was not valid JSON.'
    throw new SyntaxError(`JSON parse failed – ${hint} Raw error: ${msg}`)
  }
}

export function CodePhase({ journey, onComplete }: CompletionPhaseProps) {
  const [step, setStep] = useState<'template' | 'customize' | 'generating' | 'preview' | 'enhance' | 'analyze'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<'landing' | 'webapp' | 'dashboard'>('landing')
  const [selectedFramework, setSelectedFramework] = useState<'html' | 'react' | 'vue'>('html')
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [retryAttempt, setRetryAttempt] = useState(0)
  const [maxRetries] = useState(3)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [customizations, setCustomizations] = useState({
    includeAuth: false,
    includeForms: true,
    includeCharts: false,
    includeAccessibility: true,
    includeAnimations: true,
    includeResponsive: true,
    includeSEO: false
  })
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [aiInsights, setAiInsights] = useState<{
    recommendations: string[]
    technicalConsiderations: string[]
    securityNotes: string[]
    architectureScore: number
  } | null>(null)
  const [codeAnalysis, setCodeAnalysis] = useState<{
    quality: number
    accessibility: number
    security: number
    performance: number
    issues: string[]
    suggestions: string[]
  } | null>(null)

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
      bestFor: 'Patient-facing products, B2C healthcare services',
      features: ['Hero section with value proposition', 'Feature showcase grid', 'Patient testimonials', 'CTA forms', 'FAQ section']
    },
    {
      type: 'webapp' as const,
      name: 'Web Application',
      description: 'Multi-page app with navigation, forms, and interactive features',
      icon: '⚡',
      bestFor: 'Patient portals, telemedicine platforms, health tracking',
      features: ['User authentication', 'Patient dashboard', 'Appointment booking', 'Health records view', 'Messaging system']
    },
    {
      type: 'dashboard' as const,
      name: 'Admin Dashboard',
      description: 'Data-rich interface with charts, tables, and management tools',
      icon: '📊',
      bestFor: 'Provider tools, analytics platforms, practice management',
      features: ['Analytics overview', 'Patient management table', 'Appointment calendar', 'Health metrics charts', 'Report generation']
    }
  ]

  const frameworks = [
    {
      id: 'html' as const,
      name: 'HTML/CSS/JS',
      description: 'Vanilla web technologies, no build step required',
      icon: '🌐',
      bestFor: 'Simple sites, quick prototypes, easy deployment'
    },
    {
      id: 'react' as const,
      name: 'React + TypeScript',
      description: 'Modern component-based framework with TypeScript',
      icon: '⚛️',
      bestFor: 'Complex apps, reusable components, type safety'
    },
    {
      id: 'vue' as const,
      name: 'Vue 3',
      description: 'Progressive framework with easy learning curve',
      icon: '💚',
      bestFor: 'Rapid development, intuitive API, flexibility'
    }
  ]

  const analyzeRequirements = async () => {
    if (!journey.prd || !journey.brand) return

    setIsGenerating(true)
    try {
      const prompt = window.spark.llmPrompt`You are a healthcare tech architect. Analyze this PRD and provide intelligent code generation recommendations:

Brand: ${journey.brand.name}
Brand Personality: ${journey.brand.personality ? `${journey.brand.personality.archetype} - ${journey.brand.personality.tone.join(', ')}` : 'Not specified'}

PRD Problem: ${journey.prd.sections.problem.content.slice(0, 500)}
PRD Solution: ${journey.prd.sections.solution.content.slice(0, 500)}
PRD Features: ${journey.prd.sections.features.content.slice(0, 500)}
PRD Target Users: ${journey.prd.sections.targetUsers.content.slice(0, 300)}
PRD Regulatory: ${journey.prd.sections.regulatory.content.slice(0, 400)}

Template Type: ${selectedTemplate}
Framework: ${selectedFramework}

Generate a JSON object with:
- recommendations: Array of 4-5 specific technical recommendations for this product (e.g., "Implement end-to-end encryption for messaging", "Use chart.js for patient vitals visualization")
- technicalConsiderations: Array of 3-4 technical decisions needed (frameworks, APIs, data handling approaches)
- securityNotes: Array of 3-4 critical security/compliance considerations for implementation
- architectureScore: A numerical score from 0-100 representing how well-planned this architecture is based on the PRD

Be specific to this healthcare context, template type, and chosen framework.`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const insights = JSON.parse(response)
      
      const normalizeArray = (arr: any[]): string[] => {
        if (!Array.isArray(arr)) return []
        return arr.map(item => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object') {
            return item.recommendation || item.reason || item.note || item.consideration || JSON.stringify(item)
          }
          return String(item)
        })
      }
      
      setAiInsights({
        recommendations: normalizeArray(insights.recommendations || []),
        technicalConsiderations: normalizeArray(insights.technicalConsiderations || []),
        securityNotes: normalizeArray(insights.securityNotes || []),
        architectureScore: typeof insights.architectureScore === 'number' ? insights.architectureScore : 70
      })
    } catch (error) {
      console.error('Failed to analyze requirements:', error)
      toast.error('Failed to analyze requirements')
    } finally {
      setIsGenerating(false)
    }
  }

  const analyzeGeneratedCode = async () => {
    if (!generatedCode) return
    
    setIsGenerating(true)
    try {
      const codeContent = generatedCode.files.map(f => `// ${f.path}\n${f.content.slice(0, 1000)}`).join('\n\n')
      
      const prompt = window.spark.llmPrompt`You are a code quality expert specializing in healthcare applications. Analyze this generated code and provide a comprehensive quality assessment:

Template: ${selectedTemplate}
Framework: ${selectedFramework}

Code Files:
${codeContent}

Customizations Applied:
- Authentication: ${customizations.includeAuth}
- Form Validation: ${customizations.includeForms}
- Data Visualizations: ${customizations.includeCharts}
- Accessibility: ${customizations.includeAccessibility}
- Animations: ${customizations.includeAnimations}
- Responsive Design: ${customizations.includeResponsive}
- SEO: ${customizations.includeSEO}

Generate a JSON object with:
- quality: Overall code quality score (0-100) based on clean code principles, maintainability, and structure
- accessibility: Accessibility compliance score (0-100) based on WCAG guidelines and semantic HTML
- security: Security assessment score (0-100) evaluating potential vulnerabilities and healthcare compliance
- performance: Performance score (0-100) assessing load times, optimization, and best practices
- issues: Array of 3-5 specific issues found in the code that should be addressed
- suggestions: Array of 3-5 actionable improvement suggestions

Be specific and actionable in your analysis.`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const analysis = JSON.parse(response)
      
      const normalizeArray = (arr: any[]): string[] => {
        if (!Array.isArray(arr)) return []
        return arr.map(item => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object') {
            return item.recommendation || item.reason || item.issue || item.suggestion || JSON.stringify(item)
          }
          return String(item)
        })
      }
      
      setCodeAnalysis({
        quality: typeof analysis.quality === 'number' ? analysis.quality : 70,
        accessibility: typeof analysis.accessibility === 'number' ? analysis.accessibility : 70,
        security: typeof analysis.security === 'number' ? analysis.security : 70,
        performance: typeof analysis.performance === 'number' ? analysis.performance : 70,
        issues: normalizeArray(analysis.issues || []),
        suggestions: normalizeArray(analysis.suggestions || [])
      })
      successToast('Code analysis complete!')
    } catch (error) {
      console.error('Failed to analyze code:', error)
      toast.error('Code analysis failed')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (step === 'customize' && !aiInsights) {
      analyzeRequirements()
    }
  }, [step])

  const generateCode = async (retryCount = 0, maxRetries = 3) => {
    if (!journey.prd || !journey.brand) {
      toast.error('Please complete PRD and Brand phases first')
      return
    }

    setIsGenerating(true)
    setStep('generating')
    setRetryAttempt(0)

    const attemptGeneration = async (attemptNumber: number): Promise<void> => {
      try {
        setRetryAttempt(attemptNumber)
        
        const personalityContext = journey.brand.personality ? `
Brand Personality: ${journey.brand.personality.archetype}, tone=${journey.brand.personality.tone.join('/')}, feel=${journey.brand.personality.targetFeeling}, style=${journey.brand.personality.styleDirection}` : ''

        const featuresContext = selectedFeatures.length > 0 ? `
Priority Features: ${selectedFeatures.join(', ')}` : ''

        const customizationContext = `Auth=${customizations.includeAuth}, Forms=${customizations.includeForms}, Charts=${customizations.includeCharts}, A11y=${customizations.includeAccessibility}, Animations=${customizations.includeAnimations}, Responsive=${customizations.includeResponsive}, SEO=${customizations.includeSEO}`

        const frameworkGuide = getFrameworkBestPractices(selectedFramework as FrameworkType)
        const templateGuide = getTemplateArchitecture(selectedTemplate)
        
        const templateLayout = selectedTemplate === 'landing'
          ? 'hero section with headline, feature cards, social proof, and CTA'
          : selectedTemplate === 'webapp'
          ? 'sidebar navigation, top bar, dashboard metrics, and interactive sections'
          : 'sidebar menu, KPI cards, data table, chart area, and activity feed'

        const prompt = window.spark.llmPrompt`You are a ${frameworkGuide.name} engineer building a healthcare ${selectedTemplate}. Generate production-ready code.

FRAMEWORK: ${frameworkGuide.name}
FILE STRUCTURE: ${templateGuide.fileStructure[selectedFramework as FrameworkType].join(', ')}

BRAND:
Name: ${journey.brand.name}
Tagline: ${journey.brand.tagline}
Colors: primary=${journey.brand.colors.primary}, secondary=${journey.brand.colors.secondary}, accent=${journey.brand.colors.accent}
${personalityContext}

PRODUCT:
Problem: ${journey.prd.sections.problem.content.slice(0, 300)}
Solution: ${journey.prd.sections.solution.content.slice(0, 300)}
Users: ${journey.prd.sections.targetUsers.content.slice(0, 200)}
Features: ${journey.prd.sections.features.content.slice(0, 400)}
${featuresContext}
${customizationContext}

DESIGN:
Layout: ${templateLayout}
Accessibility: ${customizations.includeAccessibility ? 'WCAG 2.1 AA – aria-labels, focus rings, semantic HTML' : 'Basic semantic HTML'}
Animations: ${customizations.includeAnimations ? 'CSS keyframe entrance effects, hover transforms' : 'Subtle hover transitions only'}
Auth UI: ${customizations.includeAuth ? 'Login/signup modal with social login placeholders' : 'None'}
Forms: ${customizations.includeForms ? 'Floating labels, inline validation, animated submit' : 'Simple form elements'}
Charts: ${customizations.includeCharts ? 'SVG sparklines or canvas placeholders matching brand colors' : 'Data summary cards'}
Responsive: ${customizations.includeResponsive ? 'Mobile-first CSS Grid/Flexbox, hamburger menu' : 'Desktop layout'}
SEO: ${customizations.includeSEO ? 'Meta tags, Open Graph, JSON-LD HealthcareBusiness schema' : 'Basic meta tags'}
Healthcare extras: inline SVG health icons, HIPAA trust badge, warm patient-centric copy, CSS custom properties for brand colors.

OUTPUT: Return ONLY a JSON object – no markdown fences, no extra text – with this exact shape:
{"files":[{"path":"<filename>","content":"<complete file content>"}]}
Limit to ${MAX_GENERATED_FILES} files maximum to keep the response concise.`

        const response = await window.spark.llm(prompt, 'gpt-4o', true)
        const result = safeJsonParse(response)

        if (!result.files || !Array.isArray(result.files) || result.files.length === 0) {
          throw new Error('Invalid response: No files generated')
        }

        const validatedFiles = result.files.map((file: any) => ({
          path: file.path || 'untitled.txt',
          content: file.content || ''
        }))

        const code: GeneratedCode = {
          template: selectedTemplate,
          files: validatedFiles,
          previewUrl: undefined,
          timestamp: Date.now()
        }

        setGeneratedCode(code)
        setStep('preview')
        successToast('Code generated successfully! 🚀')
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error occurred'
        const errorType = error?.name || 'Error'
        
        console.error(`[Code Generation Error] Attempt ${attemptNumber + 1}/${maxRetries + 1}:`, {
          errorType,
          errorMessage,
          template: selectedTemplate,
          framework: selectedFramework,
          customizations,
          selectedFeatures,
          timestamp: new Date().toISOString(),
          stack: error?.stack
        })
        
        if (attemptNumber < maxRetries) {
          const delayMs = Math.pow(2, attemptNumber) * 1000
          toast.error(`Generation failed (${errorType}): ${errorMessage}. Retrying in ${delayMs / 1000}s... (Attempt ${attemptNumber + 1}/${maxRetries + 1})`)
          
          await new Promise(resolve => setTimeout(resolve, delayMs))
          
          return attemptGeneration(attemptNumber + 1)
        } else {
          throw error
        }
      }
    }

    try {
      await attemptGeneration(0)
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred'
      const errorType = error?.name || 'Error'
      
      console.error('[Code Generation Failed - All Retries Exhausted]:', {
        errorType,
        errorMessage,
        totalAttempts: maxRetries + 1,
        template: selectedTemplate,
        framework: selectedFramework,
        journeyContext: {
          hasBrand: !!journey.brand,
          hasPRD: !!journey.prd,
          hasConcept: !!journey.concept
        },
        timestamp: new Date().toISOString(),
        stack: error?.stack
      })
      
      toast.error(`Code generation failed after ${maxRetries + 1} attempts: ${errorMessage}. Check console for details.`)
      setStep('customize')
    } finally {
      setIsGenerating(false)
    }
  }

  const enhanceCode = async (enhancement: string) => {
    if (!generatedCode) return

    setIsGenerating(true)
    try {
      const prompt = window.spark.llmPrompt`You are enhancing existing healthcare web code. 

Current code files:
${generatedCode.files.map(f => `${f.path}:\n${f.content.slice(0, 500)}`).join('\n\n')}

Enhancement request: ${enhancement}

Brand: ${journey.brand?.name || 'Not specified'}
Personality: ${journey.brand?.personality ? `${journey.brand.personality.archetype} - ${journey.brand.personality.tone.join(', ')}` : 'Not specified'}

Return ONLY a JSON object – no markdown fences, no extra text – with this exact shape:
{"files":[{"path":"<filename>","content":"<complete enhanced file content>"}]}
Include only files that need to change. Make the enhancement production-ready and well-integrated.`

      const response = await window.spark.llm(prompt, 'gpt-4o', true)
      const result = safeJsonParse(response)

      const updatedFiles = generatedCode.files.map(existingFile => {
        const enhancedFile = result.files.find((f: any) => f.path === existingFile.path)
        return enhancedFile || existingFile
      })

      const newFiles = result.files.filter((f: any) => 
        !generatedCode.files.some(existing => existing.path === f.path)
      )

      setGeneratedCode({
        ...generatedCode,
        files: [...updatedFiles, ...newFiles]
      })

      toast.success('Code enhanced successfully!')
    } catch (error) {
      toast.error('Failed to enhance code. Please try again.')
      console.error(error)
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

  const extractedFeatures = journey.prd?.sections.features.content
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*') || line.match(/^\d+\./))
    .map(line => line.replace(/^[-*\d.]+\s*/, '').trim())
    .filter(line => line.length > 10 && line.length < 150)
    .slice(0, 8) || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">AI-Powered Code Generator</h1>
        <p className="text-lg text-muted-foreground">Transform your PRD into production-ready code</p>
      </div>

      {journey.brand?.personality && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary" weight="fill" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  AI-Enhanced Code Generation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your code will reflect your <strong>{journey.brand.personality.archetype}</strong> brand personality and incorporate intelligent recommendations based on your PRD
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'template' && (
        <div className="space-y-6">
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
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {template.features.map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Best for: {template.bestFor}
                      </Badge>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Choose Your Framework</CardTitle>
              <CardDescription>Select the technology stack for your code generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {frameworks.map((framework) => (
                <button
                  key={framework.id}
                  onClick={() => setSelectedFramework(framework.id)}
                  className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                    selectedFramework === framework.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{framework.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{framework.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{framework.description}</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Best for:</strong> {framework.bestFor}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setStep('customize')} className="w-full" size="lg">
                Continue to Customization
                <ArrowRight className="ml-2" weight="bold" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 'customize' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ListChecks weight="fill" className="text-indigo-600" />
                    {selectedFramework.toUpperCase()} Best Practices Applied
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Your code will follow {getFrameworkBestPractices(selectedFramework as FrameworkType).name} industry standards
                  </CardDescription>
                </div>
                <Code className="w-12 h-12 text-indigo-300" weight="duotone" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Shield weight="fill" className="w-4 h-4 text-indigo-600" />
                    Security & Healthcare Compliance
                  </h3>
                  <ul className="space-y-1 text-xs">
                    {getFrameworkBestPractices(selectedFramework as FrameworkType).securityPractices.slice(0, 3).map((practice, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5">✓</span>
                        <span className="text-muted-foreground">{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Target weight="fill" className="w-4 h-4 text-purple-600" />
                    Performance & Optimization
                  </h3>
                  <ul className="space-y-1 text-xs">
                    {getFrameworkBestPractices(selectedFramework as FrameworkType).performanceOptimizations.slice(0, 3).map((opt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-0.5">⚡</span>
                        <span className="text-muted-foreground">{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Users weight="fill" className="w-4 h-4 text-green-600" />
                    Accessibility (WCAG 2.1 AA)
                  </h3>
                  <ul className="space-y-1 text-xs">
                    {getFrameworkBestPractices(selectedFramework as FrameworkType).accessibilityGuidelines.slice(0, 3).map((guideline, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">♿</span>
                        <span className="text-muted-foreground">{guideline}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Brain weight="fill" className="w-4 h-4 text-blue-600" />
                    Component Architecture
                  </h3>
                  <ul className="space-y-1 text-xs">
                    {getFrameworkBestPractices(selectedFramework as FrameworkType).componentArchitecture.slice(0, 3).map((arch, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">🏗</span>
                        <span className="text-muted-foreground">{arch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-indigo-600">Healthcare-Specific:</strong> Your code will include {getFrameworkBestPractices(selectedFramework as FrameworkType).healthcareSpecific.length}+ healthcare-specific implementations including HIPAA-compliant patterns, patient data handling, and medical UI components.
                </p>
              </div>
            </CardContent>
          </Card>

          {aiInsights && (
            <Card className="bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain weight="fill" className="text-accent" />
                      AI Architecture Analysis
                    </CardTitle>
                    <CardDescription>Intelligent recommendations for {selectedFramework.toUpperCase()} {selectedTemplate}</CardDescription>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{aiInsights.architectureScore}</div>
                    <div className="text-xs text-muted-foreground">Architecture Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Sparkle className="w-4 h-4" weight="fill" />
                    Technical Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-accent mt-0.5 flex-shrink-0">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Target weight="fill" className="w-4 h-4" />
                    Technical Decisions
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.technicalConsiderations.map((note, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5 flex-shrink-0">→</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Shield weight="fill" className="w-4 h-4" />
                    Security & Compliance Notes
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.securityNotes.map((note, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-orange-600 mt-0.5 flex-shrink-0">⚠</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Customize Your Code Generation</CardTitle>
              <CardDescription>Select features to include in your MVP</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Code Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customizations.includeAuth}
                      onChange={(e) => setCustomizations({ ...customizations, includeAuth: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">User Authentication</div>
                      <div className="text-xs text-muted-foreground">Login/signup UI components</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customizations.includeForms}
                      onChange={(e) => setCustomizations({ ...customizations, includeForms: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">Form Validation</div>
                      <div className="text-xs text-muted-foreground">Error states & validation logic</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customizations.includeCharts}
                      onChange={(e) => setCustomizations({ ...customizations, includeCharts: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">Data Visualizations</div>
                      <div className="text-xs text-muted-foreground">Charts for health metrics</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customizations.includeAccessibility}
                      onChange={(e) => setCustomizations({ ...customizations, includeAccessibility: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">WCAG Accessibility</div>
                      <div className="text-xs text-muted-foreground">Screen reader & keyboard support</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customizations.includeAnimations}
                      onChange={(e) => setCustomizations({ ...customizations, includeAnimations: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">Micro-interactions</div>
                      <div className="text-xs text-muted-foreground">Smooth animations & transitions</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customizations.includeResponsive}
                      onChange={(e) => setCustomizations({ ...customizations, includeResponsive: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">Responsive Design</div>
                      <div className="text-xs text-muted-foreground">Mobile-first responsive layouts</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customizations.includeSEO}
                      onChange={(e) => setCustomizations({ ...customizations, includeSEO: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <div>
                      <div className="font-medium">SEO Optimization</div>
                      <div className="text-xs text-muted-foreground">Meta tags & semantic HTML</div>
                    </div>
                  </label>
                </div>
              </div>

              {extractedFeatures.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">Priority Features from PRD</h3>
                  <p className="text-xs text-muted-foreground">Select up to 3 features to prioritize in code generation</p>
                  <div className="grid grid-cols-1 gap-2">
                    {extractedFeatures.map((feature, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedFeatures.includes(feature)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(feature)}
                          onChange={(e) => {
                            if (e.target.checked && selectedFeatures.length < 3) {
                              setSelectedFeatures([...selectedFeatures, feature])
                            } else if (!e.target.checked) {
                              setSelectedFeatures(selectedFeatures.filter(f => f !== feature))
                            }
                          }}
                          disabled={!selectedFeatures.includes(feature) && selectedFeatures.length >= 3}
                          className="mt-0.5 w-4 h-4"
                        />
                        <span className="text-sm flex-1">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('template')}>
                Back
              </Button>
              <Button onClick={() => generateCode()} disabled={isGenerating} className="flex-1" size="lg">
                <Sparkle className="mr-2" weight="fill" />
                Generate AI-Powered Code
              </Button>
            </CardFooter>
          </Card>
        </div>
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
              <h3 className="text-xl font-semibold mb-2">Crafting Your {getFrameworkBestPractices(selectedFramework as FrameworkType).name} Application...</h3>
              <p className="text-muted-foreground">
                Building a stunning {templates.find(t => t.type === selectedTemplate)?.name} for <strong>{journey.brand?.name || 'your brand'}</strong>
              </p>
              {retryAttempt > 0 && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                  Retry attempt {retryAttempt}/{maxRetries}
                </p>
              )}
            </div>
            <div className="max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>✨ Interpreting your brand personality & colors</p>
              <p>🏥 Infusing healthcare-specific design patterns</p>
              <p>🎨 Crafting pixel-perfect UI components</p>
              <p>⚡ Applying {selectedFramework.toUpperCase()} best practices & optimizations</p>
              <p>🔒 Implementing healthcare security standards</p>
              <p>♿ Ensuring WCAG 2.1 AA accessibility compliance</p>
              <p className="animate-pulse">🚀 Assembling production-ready code files...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'preview' && generatedCode && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-green-600 dark:text-green-400" weight="fill" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Code Generated Successfully!</h3>
                  <p className="text-sm text-muted-foreground">
                    {generatedCode.files.length} production-ready files with {generatedCode.files.reduce((sum, f) => sum + f.content.split('\n').length, 0)} lines of code
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <LiveCodePreview 
            files={generatedCode.files} 
            onCodeUpdate={(updatedFiles) => {
              setGeneratedCode((prev) => prev ? { ...prev, files: updatedFiles } : null)
            }}
            brandName={journey.brand?.name}
          />

          <Card>
            <CardHeader>
              <CardTitle>Generated Code Structure</CardTitle>
              <CardDescription>
                Your {templates.find(t => t.type === selectedTemplate)?.name} is ready for development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {generatedCode.files.map((file, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 font-mono text-sm font-semibold flex items-center justify-between">
                      <span>{file.path}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {file.content.split('\n').length} lines
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(file.content)
                            toast.success(`Copied ${file.path}`)
                          }}
                          className="h-6 px-2 text-xs"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <pre className="p-4 text-xs font-mono bg-background">
                        <code>{file.content}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                ))}
              </div>

              {codeAnalysis && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain weight="fill" className="text-purple-600" />
                      AI Code Quality Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
                        <div className={`text-3xl font-bold ${codeAnalysis.quality >= 80 ? 'text-green-600' : codeAnalysis.quality >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
                          {codeAnalysis.quality}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Code Quality</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
                        <div className={`text-3xl font-bold ${codeAnalysis.accessibility >= 80 ? 'text-green-600' : codeAnalysis.accessibility >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
                          {codeAnalysis.accessibility}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Accessibility</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
                        <div className={`text-3xl font-bold ${codeAnalysis.security >= 80 ? 'text-green-600' : codeAnalysis.security >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
                          {codeAnalysis.security}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Security</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-white/50 dark:bg-black/20">
                        <div className={`text-3xl font-bold ${codeAnalysis.performance >= 80 ? 'text-green-600' : codeAnalysis.performance >= 60 ? 'text-yellow-600' : 'text-orange-600'}`}>
                          {codeAnalysis.performance}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Performance</div>
                      </div>
                    </div>

                    {codeAnalysis.issues.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Shield weight="fill" className="w-4 h-4 text-orange-600" />
                          Issues Found
                        </h3>
                        <ul className="space-y-2">
                          {codeAnalysis.issues.map((issue, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2 p-2 rounded bg-orange-50 dark:bg-orange-950/30">
                              <span className="text-orange-600 mt-0.5 flex-shrink-0">⚠</span>
                              <span>{issue}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {codeAnalysis.suggestions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <Sparkle weight="fill" className="w-4 h-4 text-blue-600" />
                          Improvement Suggestions
                        </h3>
                        <ul className="space-y-2">
                          {codeAnalysis.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950/30">
                              <span className="text-blue-600 mt-0.5 flex-shrink-0">→</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold mb-1 text-blue-900 dark:text-blue-100">Next Steps</p>
                      <p className="text-blue-700 dark:text-blue-300 text-xs">
                        Download these files, set up your development environment, and start customizing with your specific business logic
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div className="flex-1 text-sm">
                      <p className="font-semibold mb-1 text-orange-900 dark:text-orange-100">Before Production</p>
                      <p className="text-orange-700 dark:text-orange-300 text-xs">
                        Add authentication, integrate backend APIs, implement HIPAA compliance, and conduct security audits
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('customize')}>
                Regenerate
              </Button>
              <Button 
                variant="outline" 
                onClick={analyzeGeneratedCode} 
                disabled={isGenerating || !!codeAnalysis}
              >
                <Brain className="mr-2" weight="fill" />
                {codeAnalysis ? 'Analysis Complete' : 'Analyze Code Quality'}
              </Button>
              <Button variant="outline" onClick={() => setStep('enhance')}>
                <Sparkle className="mr-2" weight="fill" />
                AI Enhance
              </Button>
              <Button onClick={handleComplete} className="flex-1">
                Complete Code Phase
                <ArrowRight className="ml-2" weight="bold" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 'enhance' && generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle>AI Code Enhancement</CardTitle>
            <CardDescription>Add specific improvements to your generated code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => enhanceCode('Add comprehensive error handling and loading states to all components')}
                disabled={isGenerating}
                className="h-auto py-4 justify-start text-left"
              >
                <div>
                  <div className="font-semibold text-sm">Error Handling</div>
                  <div className="text-xs text-muted-foreground">Add try-catch blocks and error states</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => enhanceCode('Improve responsive design for mobile devices with touch-friendly interactions')}
                disabled={isGenerating}
                className="h-auto py-4 justify-start text-left"
              >
                <div>
                  <div className="font-semibold text-sm">Mobile Optimization</div>
                  <div className="text-xs text-muted-foreground">Enhance mobile experience</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => enhanceCode('Add SEO meta tags, Open Graph tags, and improve semantic HTML structure')}
                disabled={isGenerating}
                className="h-auto py-4 justify-start text-left"
              >
                <div>
                  <div className="font-semibold text-sm">SEO & Meta Tags</div>
                  <div className="text-xs text-muted-foreground">Improve discoverability</div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => enhanceCode('Add performance optimizations like lazy loading, code splitting, and image optimization')}
                disabled={isGenerating}
                className="h-auto py-4 justify-start text-left"
              >
                <div>
                  <div className="font-semibold text-sm">Performance</div>
                  <div className="text-xs text-muted-foreground">Speed up load times</div>
                </div>
              </Button>
            </div>

            {isGenerating && (
              <div className="text-center py-8">
                <Sparkle className="w-8 h-8 mx-auto mb-3 animate-pulse text-primary" weight="fill" />
                <p className="text-sm text-muted-foreground">Enhancing your code...</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('preview')}>
              Back to Preview
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Complete Code Phase
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

export function GitHubPhase({ journey, onComplete }: CompletionPhaseProps) {
  const [step, setStep] = useState<'summary' | 'configure' | 'deployment-options' | 'creating' | 'success'>('summary')
  const [deploymentChoice, setDeploymentChoice] = useState<'personal' | null>(null)
  const [repoName, setRepoName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [includeDocker, setIncludeDocker] = useState(true)
  const [includeCICD, setIncludeCICD] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    if (journey.githubRepo) {
      setStep('success')
    } else if (journey.brand?.name) {
      const generatedName = journey.brand.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setRepoName(generatedName)
    }
  }, [])

  const handleCreateRepo = async () => {
    if (!journey.code || !repoName.trim()) {
      toast.error('Repository name is required')
      return
    }

    setIsCreating(true)
    setError(null)
    setStep('creating')

    try {
      const { createGitHubRepository, generateRepoDescription, generateReadmeContent } = await import('@/lib/github')
      const { getAllCICDFiles } = await import('@/lib/cicd')
      
      const description = generateRepoDescription(journey)
      
      const updatedJourneyForReadme = {
        ...journey,
        githubRepo: {
          name: repoName,
          url: '',
          createdAt: Date.now(),
          deploymentPlatforms: selectedPlatforms,
          includeDocker,
          includeCICD
        }
      }
      const readmeContent = generateReadmeContent(updatedJourneyForReadme)
      
      const filesToCommit = [...journey.code.files]
      
      filesToCommit.push({
        path: 'README.md',
        content: readmeContent
      })
      
      if (includeDocker || includeCICD) {
        const deploymentFiles = getAllCICDFiles(
          'html',
          journey.code.template,
          journey.brand?.name || 'project',
          selectedPlatforms as any[]
        )
        filesToCommit.push(...deploymentFiles)
      }

      const repo = await createGitHubRepository({
        name: repoName,
        description,
        isPrivate,
        files: filesToCommit
      })

      const repoWithConfig = {
        ...repo,
        deploymentPlatforms: selectedPlatforms,
        includeDocker,
        includeCICD
      }

      const updatedJourney = { ...journey, githubRepo: repoWithConfig }
      const completedJourney = completePhase(updatedJourney, 'github')
      
      if (onComplete) {
        onComplete(completedJourney)
      }

      setStep('success')
      toast.success('🎉 Repository created successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to create repository')
      toast.error(err.message || 'Failed to create repository')
      setStep('deployment-options')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">{t.github.title}</h1>
        <p className="text-lg text-muted-foreground">
          {step === 'summary' ? t.github.subtitle : 
           step === 'configure' ? t.github.subtitleConfigure :
           step === 'deployment-options' ? 'Select deployment platforms and configurations' :
           step === 'creating' ? t.github.subtitleCreating :
           t.github.subtitleSuccess}
        </p>
      </div>

      {step === 'summary' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket weight="fill" className="text-primary" />
                {t.github.journeySummary}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {journey.concept && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{t.github.concept}</h3>
                  <p className="text-sm">{journey.concept.problem}</p>
                </div>
              )}
              
              {journey.brand && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{t.github.brand}</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{journey.brand.logo}</div>
                    <div>
                      <div className="font-semibold">{journey.brand.name}</div>
                      <div className="text-sm text-muted-foreground">{journey.brand.tagline}</div>
                    </div>
                  </div>
                </div>
              )}

              {journey.code && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{t.github.generatedCode}</h3>
                  <div className="flex flex-wrap gap-2">
                    {journey.code.files.map((file, idx) => (
                      <Badge key={idx} variant="secondary">
                        {file.path}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Sparkle weight="fill" className="text-primary" />
                <div>
                  <div className="font-semibold">{t.level} {journey.gameState.level} {t.founderLevel}</div>
                  <div className="text-sm text-muted-foreground">
                    {journey.gameState.xp} XP {t.github.journeyCompleteStats} • {journey.gameState.badges.filter(b => b.earned).length} {t.github.badges}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.github.deployYourCode}</CardTitle>
              <CardDescription>
                {t.github.readyToDeployDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{t.github.downloadCodeFiles}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.github.downloadCodeDesc}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {journey.code?.files.map((file, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([file.content], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = file.path
                            a.click()
                            URL.revokeObjectURL(url)
                            toast.success(`Downloaded ${file.path}`)
                          }}
                        >
                          {file.path}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" weight="fill" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">{t.github.manualGitHubSetup}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {t.github.manualSetupDesc}
                    </p>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal ml-4">
                      <li>{t.github.manualStep1}</li>
                      <li>{t.github.manualStep2}</li>
                      <li>{t.github.manualStep3}</li>
                      <li>{t.github.manualStep4}</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  if (onComplete) {
                    const updatedJourney = completePhase(journey, 'github')
                    onComplete(updatedJourney)
                  }
                  setStep('success')
                }}
                className="w-full"
                size="lg"
              >
                <Check className="mr-2" weight="bold" />
                {t.github.completeJourney}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 'configure' && (
        <Card>
          <CardHeader>
            <CardTitle>{t.github.configureRepository}</CardTitle>
            <CardDescription>{t.github.configureRepoDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
                <p className="font-semibold text-destructive mb-1">{t.error}</p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="repo-name" className="text-sm font-semibold">
                {t.github.repositoryName}
              </label>
              <input
                id="repo-name"
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder={t.github.repoNamePlaceholder}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
              <p className="text-xs text-muted-foreground">
                {t.github.repoNameDesc}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">{t.github.repositoryVisibility}</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium">{t.github.public}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.publicDesc}
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                  <input
                    type="radio"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium">{t.github.private}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.privateDesc}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold mb-1 text-blue-900 dark:text-blue-100">{t.github.authenticationRequired}</p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    {t.github.authRequiredDesc}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('summary')}>
              {t.back}
            </Button>
            <Button 
              onClick={() => setStep('deployment-options')} 
              disabled={!repoName.trim()}
              className="flex-1"
              size="lg"
            >
              <ArrowRight className="mr-2" weight="bold" />
              {t.github.continueToDeployment || 'Continue to Deployment'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'deployment-options' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket weight="fill" className="text-primary" />
              {t.github.deploymentConfiguration || 'Deployment Configuration'}
            </CardTitle>
            <CardDescription>
              {t.github.deploymentConfigurationDesc || 'Choose deployment platforms and configure CI/CD pipeline for your application'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">{t.github.selectPlatforms || 'Select Deployment Platforms'}</h3>
                <Badge variant="secondary" className="text-xs">
                  {selectedPlatforms.length} selected
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.github.selectPlatformsDesc || 'Choose one or more platforms where you want to deploy your application. CI/CD workflows and config files will be automatically generated.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('vercel')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'vercel'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'vercel'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      Vercel
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Recommended for React/Vue</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Zero-config deployments with automatic HTTPS and global CDN
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('netlify')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'netlify'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'netlify'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      Netlify
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Great for static sites</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All-in-one platform with form handling and serverless functions
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('github-pages')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'github-pages'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'github-pages'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      GitHub Pages
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-100 dark:bg-green-900">Free</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Free static site hosting directly from your repository
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('railway')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'railway'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'railway'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Railway</div>
                    <p className="text-xs text-muted-foreground">
                      Modern platform with database support and easy scaling
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('render')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'render'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'render'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Render</div>
                    <p className="text-xs text-muted-foreground">
                      Unified cloud for static sites, web services, and databases
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-base">{t.github.additionalOptions || 'Additional Configuration'}</h3>
              
              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCICD}
                  onChange={(e) => setIncludeCICD(e.target.checked)}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    <GitBranch weight="bold" className="w-4 h-4 text-primary" />
                    {t.github.includeCI || 'Include CI/CD Pipeline'}
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Recommended</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t.github.includeCIDesc || 'Automatically generate GitHub Actions workflows for continuous deployment to selected platforms'}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Automatic deployments on push to main branch</p>
                    <p>✓ Preview deployments for pull requests</p>
                    <p>✓ Build and test automation</p>
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDocker}
                  onChange={(e) => setIncludeDocker(e.target.checked)}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    <Package weight="bold" className="w-4 h-4" />
                    {t.github.includeDocker || 'Include Docker Configuration'}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t.github.includeDockerDesc || 'Generate Dockerfile and docker-compose.yml for containerized deployments'}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Dockerfile with multi-stage builds</p>
                    <p>✓ Docker Compose for local development</p>
                    <p>✓ Production-ready container configuration</p>
                  </div>
                </div>
              </label>
            </div>

            {selectedPlatforms.length > 0 && (includeCICD || includeDocker) && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" weight="fill" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                      {t.github.filesWillBeGenerated || 'Files that will be generated:'}
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 text-xs space-y-1 ml-4 list-disc">
                      <li>README.md with deployment instructions</li>
                      <li>DEPLOYMENT.md with detailed platform guides</li>
                      {includeCICD && selectedPlatforms.map(platform => (
                        <li key={platform}>.github/workflows/deploy-{platform}.yml</li>
                      ))}
                      {includeCICD && selectedPlatforms.includes('vercel') && <li>vercel.json configuration</li>}
                      {includeCICD && selectedPlatforms.includes('netlify') && <li>netlify.toml configuration</li>}
                      {includeDocker && <li>Dockerfile for production builds</li>}
                      {includeDocker && <li>docker-compose.yml for local development</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('configure')}>
              {t.back}
            </Button>
            <Button 
              onClick={handleCreateRepo} 
              disabled={!repoName.trim() || isCreating}
              className="flex-1"
              size="lg"
            >
              {isCreating ? (
                <>{t.github.creatingRepository}</>
              ) : (
                <>
                  <Rocket className="mr-2" weight="fill" />
                  {t.github.createRepository}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'creating' && (
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Rocket className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" weight="fill" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{t.github.creatingRepoProgress}</h3>
              <p className="text-muted-foreground">{t.github.creatingRepoWait}</p>
            </div>
            <div className="max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>✓ {t.github.creatingRepoStep1}</p>
              <p>✓ {t.github.creatingRepoStep2}</p>
              <p>✓ {t.github.creatingRepoStep3}</p>
              <p className="animate-pulse">⏳ {t.github.creatingRepoStep4}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'success' && journey.githubRepo && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎉</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{t.github.repoCreatedSuccess}</h3>
                  <p className="text-muted-foreground">{t.github.startupLiveOnGitHub}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.github.yourGitHubRepo}</CardTitle>
              <CardDescription>{t.github.accessCodeAnytime}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-lg border-2 border-primary/20 bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-primary" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg mb-1">{journey.githubRepo.name}</div>
                    <a 
                      href={journey.githubRepo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {journey.githubRepo.url}
                    </a>
                    {journey.githubRepo.commitSha && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Initial commit: {journey.githubRepo.commitSha.slice(0, 7)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DeploymentInstructions 
                repoUrl={journey.githubRepo.url}
                projectName={journey.githubRepo.name}
                framework="html"
                template={journey.code?.template || 'landing'}
              />

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">{t.github.nextStepsGitHub}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={journey.githubRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="font-medium mb-1">{t.github.viewOnGitHub}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.viewOnGitHubDesc}
                    </div>
                  </a>

                  <a
                    href={`${journey.githubRepo.url}/archive/refs/heads/main.zip`}
                    className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="font-medium mb-1">{t.github.downloadCode}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.downloadCodeDesc}
                    </div>
                  </a>

                  <a
                    href={`${journey.githubRepo.url}/settings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="font-medium mb-1">{t.github.repoSettings}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.repoSettingsDesc}
                    </div>
                  </a>

                  <div className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="font-medium mb-1">{t.github.cloneLocally}</div>
                    <div className="text-xs text-muted-foreground">
                      git clone {journey.githubRepo.url}.git
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold mb-1 text-orange-900 dark:text-orange-100">{t.github.remember}</p>
                    <p className="text-orange-700 dark:text-orange-300 text-xs">
                      {t.github.rememberDesc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
                <Sparkle weight="fill" className="text-primary" />
                <div>
                  <div className="font-semibold">🏆 {t.github.journeyComplete}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.level} {journey.gameState.level} {t.founderLevel} • {journey.gameState.xp} XP {t.github.journeyCompleteStats} • {journey.gameState.badges.filter(b => b.earned).length} {t.github.badges}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
