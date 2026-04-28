import { useState, useEffect } from 'react'
import { Journey, GeneratedCode } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkle, Brain, Rocket, Shield, Target, Users, Code, ListChecks, Package } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { successToast } from '@/lib/toastWithLogo'
import { completePhase } from '@/lib/game'
import { LiveCodePreview } from '@/components/LiveCodePreview'
import { getFrameworkBestPractices, getTemplateArchitecture, type FrameworkType, type TemplateType } from '@/lib/frameworkBestPractices'

interface CodePhaseProps {
  journey: Journey
  onComplete?: (updatedJourney: Journey) => void
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
    const hint = /unterminated string|unexpected end|unexpected token/i.test(msg)
      ? 'The AI response was likely truncated (hit output token limit).'
      : 'The AI response was not valid JSON.'
    throw new SyntaxError(`JSON parse failed – ${hint} Raw error: ${msg}`)
  }
}

export function CodePhase({ journey, onComplete }: CodePhaseProps) {
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
