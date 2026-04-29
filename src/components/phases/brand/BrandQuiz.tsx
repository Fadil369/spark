import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brain } from '@phosphor-icons/react'
import { BrandPersonality } from '@/lib/types'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'
import { createAIHelper } from '@/lib/aiHelper'

interface BrandQuizProps {
  onComplete: (personality: BrandPersonality) => void
  conceptData?: {
    problem?: string
    targetUsers?: string
    solution?: string
  }
}

const quizQuestions = [
  {
    id: 'archetype',
    question: 'How would you describe your healthcare startup\'s primary mission?',
    icon: '🎯',
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
    icon: '❤️',
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
    icon: '🛡️',
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
    icon: '💫',
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
    icon: '🎨',
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
    icon: '🚀',
    options: [
      { value: 'medical-clinical', label: 'Medical & Clinical', description: 'Clean, precise, professional healthcare aesthetic' },
      { value: 'tech-modern', label: 'Tech & Modern', description: 'Sleek, digital-first, contemporary design' },
      { value: 'warm-human', label: 'Warm & Human-Centered', description: 'Approachable, friendly, personal touch' },
      { value: 'bold-distinctive', label: 'Bold & Distinctive', description: 'Unique, memorable, stands out from traditional healthcare' }
    ]
  }
]

export function BrandQuiz({ onComplete, conceptData }: BrandQuizProps) {
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { t } = useLanguage()
  const bt = t.brand

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }))
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const analyzePersonality = async () => {
    setIsAnalyzing(true)
    
    try {
      const aiHelper = createAIHelper('en')
      
      const prompt = `You are a brand personality expert specializing in healthcare startups. Analyze these quiz responses and create a detailed brand personality profile:

Quiz Responses:
${Object.entries(quizAnswers).map(([key, value]) => `${key}: ${value}`).join('\n')}

Healthcare Context:
Problem: ${conceptData?.problem || ''}
Target Users: ${conceptData?.targetUsers || ''}
Solution: ${conceptData?.solution || ''}

Generate a JSON object with:
- archetype: A single-word brand archetype (e.g., "Caregiver", "Innovator", "Hero", "Sage")
- tone: Array of 3 tone descriptors (e.g., ["professional", "empathetic", "innovative"])
- values: Array of 3 core brand values (e.g., ["trust", "accessibility", "excellence"])
- targetFeeling: Single sentence describing the emotional response patients should have
- colorPreference: Recommended color direction ("cool-calming", "warm-energetic", "natural-balanced", or "vibrant-modern")
- styleDirection: Recommended visual style ("medical-clinical", "tech-modern", "warm-human", or "bold-distinctive")

Base your recommendations on the quiz responses and ensure they align with healthcare credibility.

Return ONLY valid JSON.`
      
      const response = await aiHelper.generateBrandPersonality(prompt)
      const personality = JSON.parse(response)
      
      toast.success(bt.personalityAnalyzed)
      onComplete(personality)
    } catch (error) {
      toast.error(bt.analyzeError)
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return (
      <Card>
        <CardContent className="py-16 text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <Brain className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" weight="fill" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{bt.analyzingPersonality}</h3>
            <p className="text-muted-foreground">{bt.understandingValues}</p>
          </div>
          <div className="max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
            <p>✓ {bt.processingResponses}</p>
            <p>✓ {bt.mappingArchetypes}</p>
            <p>✓ {bt.identifyingTone}</p>
            <p className="animate-pulse">⏳ {bt.creatingProfile}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain weight="fill" className="text-primary" />
          {bt.personalityQuiz}
        </CardTitle>
        <CardDescription>
          {bt.quizSubtitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>{bt.question} {currentQuestion + 1} {bt.of} {quizQuestions.length}</span>
            <span>{Math.round(((currentQuestion + (quizAnswers[quizQuestions[currentQuestion].id] ? 1 : 0)) / quizQuestions.length) * 100)}% {bt.complete}</span>
          </div>
          <Progress value={(Object.keys(quizAnswers).length / quizQuestions.length) * 100} className="h-2" />
        </div>

        {quizQuestions.map((q, idx) => {
          return idx === currentQuestion ? (
            <div key={q.id} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-2xl">
                  {q.icon}
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
            {bt.previous}
          </Button>
        )}
        {Object.keys(quizAnswers).length === quizQuestions.length && (
          <Button
            onClick={analyzePersonality}
            disabled={isAnalyzing}
            className="flex-1"
          >
            <Brain className="mr-2" weight="fill" />
            {bt.analyzePersonality}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
