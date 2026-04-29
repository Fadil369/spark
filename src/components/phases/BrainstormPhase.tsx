import { useState } from 'react'
import { Journey, ConceptCard } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkle, ArrowRight } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { successToast } from '@/lib/toastWithLogo'
import { AILoadingScreen } from '@/components/AILoadingScreen'
import { useLanguage } from '@/contexts/LanguageContext'
import { createAIHelper } from '@/lib/aiHelper'

interface BrainstormPhaseProps {
  journey: Journey
  onComplete: (concept: ConceptCard) => void
}

const HEALTHCARE_THEMES_EN = [
  'medication adherence',
  'chronic disease management',
  'mental health support',
  'elderly care coordination',
  'patient engagement',
  'provider burnout',
  'health literacy',
  'care navigation',
  'remote monitoring',
  'appointment scheduling'
]

const HEALTHCARE_THEMES_AR = [
  'الالتزام بتناول الأدوية',
  'إدارة الأمراض المزمنة',
  'دعم الصحة النفسية',
  'تنسيق رعاية كبار السن',
  'مشاركة المريض',
  'إرهاق مقدمي الرعاية',
  'محو الأمية الصحية',
  'التنقل في الرعاية',
  'المراقبة عن بُعد',
  'جدولة المواعيد'
]

export function BrainstormPhase({ journey, onComplete }: BrainstormPhaseProps) {
  const [input, setInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [concept, setConcept] = useState<Partial<ConceptCard>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState<'input' | 'refine' | 'finalize'>('input')

  const { language, t } = useLanguage()
  const bt = t.brainstorm
  const tt = t.toast
  const healthcareThemes = language === 'ar' ? HEALTHCARE_THEMES_AR : HEALTHCARE_THEMES_EN

  const handleGenerateIdeas = async () => {
    if (!input.trim()) {
      toast.error(tt.completeAllFields)
      return
    }

    setIsGenerating(true)
    try {
      const aiHelper = createAIHelper(language)
      const generatedKeywords = await aiHelper.generateHealthcareConcepts(input)
      setKeywords(generatedKeywords)
      setStep('refine')
      successToast(tt.conceptGenerated)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      toast.error(`${tt.conceptFailed}: ${msg}`)
      console.error('Generate ideas error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefineConcept = async () => {
    setIsGenerating(true)
    try {
      const aiHelper = createAIHelper(language)
      const refinedConcept = await aiHelper.refineConcept(input, keywords)
      setConcept({
        problem: refinedConcept.problem,
        targetUsers: refinedConcept.targetUsers,
        solution: refinedConcept.solution,
        keywords: [...keywords, input]
      })
      setStep('finalize')
      successToast(tt.conceptRefined)
    } catch (error) {
      toast.error(tt.conceptRefineFailed)
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = () => {
    if (!concept.problem || !concept.targetUsers || !concept.solution) {
      toast.error(tt.completeAllFields)
      return
    }

    const finalConcept: ConceptCard = {
      problem: concept.problem,
      targetUsers: concept.targetUsers,
      solution: concept.solution,
      keywords: concept.keywords || [],
      timestamp: Date.now()
    }

    onComplete(finalConcept)
  }

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold font-heading">{bt.title}</h1>
          <p className="text-lg text-muted-foreground">{bt.subtitle}</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <AILoadingScreen
              isVisible={true}
              language={language}
              message={step === 'input'
                ? (language === 'ar' ? bt.generating : 'Generating concepts...')
                : (language === 'ar' ? bt.refining : 'Refining your concept...')}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">{bt.title}</h1>
        <p className="text-lg text-muted-foreground">{bt.subtitle}</p>
      </div>

      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle>{bt.whatProblem}</CardTitle>
            <CardDescription>{bt.describeFrustrations}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="brainstorm-input"
              placeholder={bt.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">{bt.tryThemes}</p>
              <div className="flex flex-wrap gap-2">
                {healthcareThemes.map((theme) => (
                  <Badge
                    key={theme}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setInput(theme)}
                  >
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerateIdeas}
              disabled={isGenerating}
              className="w-full"
            >
              <Sparkle className="mr-2" weight="fill" />
              {bt.generateConcepts}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'refine' && (
        <Card>
          <CardHeader>
            <CardTitle>{bt.aiGeneratedConcepts}</CardTitle>
            <CardDescription>{bt.relatedIdeas}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-6">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-base py-2 px-4">
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {bt.originalInput} <span className="text-foreground font-medium">{input}</span>
            </p>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('input')}>
              {bt.startOver}
            </Button>
            <Button onClick={handleRefineConcept} disabled={isGenerating} className="flex-1">
              <Sparkle className="mr-2" weight="fill" />
              {bt.refineConcept}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'finalize' && (
        <Card>
          <CardHeader>
            <CardTitle>{bt.yourConcept}</CardTitle>
            <CardDescription>{bt.reviewFinalize}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">{bt.problem}</label>
              <Textarea
                value={concept.problem || ''}
                onChange={(e) => setConcept({ ...concept, problem: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">{bt.targetUsers}</label>
              <Textarea
                value={concept.targetUsers || ''}
                onChange={(e) => setConcept({ ...concept, targetUsers: e.target.value })}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">{bt.solutionVision}</label>
              <Textarea
                value={concept.solution || ''}
                onChange={(e) => setConcept({ ...concept, solution: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('input')}>
              {bt.startOver}
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              {bt.completeBrainstorm}
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

