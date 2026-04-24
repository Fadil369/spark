import { useState } from 'react'
import { Journey, ConceptCard } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkle, ArrowRight } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface BrainstormPhaseProps {
  journey: Journey
  onComplete: (concept: ConceptCard) => void
}

const HEALTHCARE_THEMES = [
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

export function BrainstormPhase({ journey, onComplete }: BrainstormPhaseProps) {
  const [input, setInput] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [concept, setConcept] = useState<Partial<ConceptCard>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState<'input' | 'refine' | 'finalize'>('input')

  const handleGenerateIdeas = async () => {
    if (!input.trim()) {
      toast.error('Please enter some healthcare problems or themes')
      return
    }

    setIsGenerating(true)
    try {
      const prompt = window.spark.llmPrompt`You are a healthcare startup advisor. Based on these healthcare problems or themes: "${input}", generate 8 related healthcare concepts, keywords, or problem areas. Return a JSON object with a single property "keywords" that contains an array of short phrases (2-4 words each).`
      
      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      setKeywords(data.keywords || [])
      setStep('refine')
      toast.success('AI generated related healthcare concepts!')
    } catch (error) {
      toast.error('Failed to generate ideas. Please try again.')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRefineConcept = async () => {
    setIsGenerating(true)
    try {
      const allKeywords = [input, ...keywords].join(', ')
      const prompt = window.spark.llmPrompt`You are a healthcare startup advisor. Based on these healthcare themes: "${allKeywords}", create a structured startup concept. Return a JSON object with:
      - problem: A clear 1-2 sentence description of the healthcare problem
      - targetUsers: Who is affected (e.g., "elderly diabetic patients", "primary care physicians")
      - solution: A 2-3 sentence proposed solution vision
      Make it specific to healthcare and actionable.`
      
      const response = await window.spark.llm(prompt, 'gpt-4o-mini', true)
      const data = JSON.parse(response)
      setConcept({
        problem: data.problem,
        targetUsers: data.targetUsers,
        solution: data.solution,
        keywords: [...keywords, input]
      })
      setStep('finalize')
      toast.success('Concept refined successfully!')
    } catch (error) {
      toast.error('Failed to refine concept. Please try again.')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleComplete = () => {
    if (!concept.problem || !concept.targetUsers || !concept.solution) {
      toast.error('Please complete all concept fields')
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
    toast.success('Brainstorm phase complete! 🎉')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">The Idea Forge</h1>
        <p className="text-lg text-muted-foreground">Extract healthcare problems into crisp startup concepts</p>
      </div>

      {step === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle>What healthcare problems are you passionate about?</CardTitle>
            <CardDescription>
              Describe frustrations, unmet needs, or challenges you've observed in healthcare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              id="brainstorm-input"
              placeholder="e.g., My grandmother struggles to remember when to take her medications, leading to hospital readmissions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">Or try one of these healthcare themes:</p>
              <div className="flex flex-wrap gap-2">
                {HEALTHCARE_THEMES.map((theme) => (
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
              {isGenerating ? (
                <>Generating ideas...</>
              ) : (
                <>
                  <Sparkle className="mr-2" weight="fill" />
                  Generate Related Concepts
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'refine' && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Healthcare Concepts</CardTitle>
            <CardDescription>Review these related ideas and themes</CardDescription>
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
              Original input: <span className="text-foreground font-medium">{input}</span>
            </p>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('input')}>
              Start Over
            </Button>
            <Button onClick={handleRefineConcept} disabled={isGenerating} className="flex-1">
              {isGenerating ? (
                <>Refining concept...</>
              ) : (
                <>
                  <Sparkle className="mr-2" weight="fill" />
                  Refine into Startup Concept
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'finalize' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Startup Concept</CardTitle>
            <CardDescription>Review and finalize your concept card</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Problem</label>
              <Textarea
                value={concept.problem || ''}
                onChange={(e) => setConcept({ ...concept, problem: e.target.value })}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Target Users</label>
              <Textarea
                value={concept.targetUsers || ''}
                onChange={(e) => setConcept({ ...concept, targetUsers: e.target.value })}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Solution Vision</label>
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
              Start Over
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              Complete Brainstorm
              <ArrowRight className="ml-2" weight="bold" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
