import { useState, useEffect } from 'react'
import { Journey, PRD, PRDSection } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Sparkle, CheckCircle, Circle, ArrowRight, FileText, FilePdf } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { completePhase } from '@/lib/game'
import { exportPRDToPDF } from '@/lib/prdExport'
import { useLanguage } from '@/contexts/LanguageContext'
import { createAIHelper } from '@/lib/aiHelper'

interface PRDPhaseProps {
  journey: Journey
  onComplete?: (updatedJourney: Journey) => void
}

type SectionKey = 'problem' | 'solution' | 'targetUsers' | 'features' | 'metrics' | 'regulatory'

const SECTION_CONFIG: Record<SectionKey, {
  title: string
  description: string
  template: string
  placeholder: string
  helpText: string
}> = {
  problem: {
    title: 'Problem Statement',
    description: 'Define the healthcare problem you\'re solving',
    template: `# Problem Statement

## Current Situation
[Describe the current state and why it's problematic]

## Pain Points
- [Pain point 1]
- [Pain point 2]
- [Pain point 3]

## Impact
[Quantify the impact - costs, outcomes, quality of life]

## Why Now?
[Why is this the right time to solve this problem?]`,
    placeholder: 'Define the core healthcare problem, its impact, and why it needs solving now...',
    helpText: 'Be specific about the problem scope, affected populations, and measurable impacts.'
  },
  solution: {
    title: 'Proposed Solution',
    description: 'Explain your product and how it solves the problem',
    template: `# Proposed Solution

## Overview
[High-level description of your solution]

## How It Works
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Key Differentiators
- [What makes this unique]
- [Competitive advantages]
- [Technology/approach innovation]

## Success Criteria
[How will you know if the solution works?]`,
    placeholder: 'Describe your solution, how it works, and what makes it unique...',
    helpText: 'Focus on the "what" and "how" - be clear about your approach and competitive advantages.'
  },
  targetUsers: {
    title: 'Target Users',
    description: 'Identify and profile your primary users',
    template: `# Target Users

## Primary User Persona
**Name:** [Persona name]
**Role:** [Their role in healthcare]
**Demographics:** [Age, location, background]

## User Needs
- [Need 1]
- [Need 2]
- [Need 3]

## Current Behaviors
[How do they currently handle this problem?]

## Secondary Users
[Other stakeholders who interact with your product]

## User Journey
[How will users discover and adopt your solution?]`,
    placeholder: 'Define who will use your product, their needs, and behaviors...',
    helpText: 'Create specific personas with real healthcare context - patients, providers, administrators, etc.'
  },
  features: {
    title: 'Core Features',
    description: 'List and prioritize your product features',
    template: `# Core Features

## MVP Features (Must Have)
### Feature 1: [Name]
- **Description:** [What it does]
- **User Value:** [Why it matters]
- **Technical Approach:** [How you'll build it]

### Feature 2: [Name]
- **Description:** 
- **User Value:** 
- **Technical Approach:** 

## Phase 2 Features (Should Have)
- [Feature]
- [Feature]

## Future Enhancements (Nice to Have)
- [Feature]
- [Feature]

## Feature Prioritization Rationale
[Explain why you chose this prioritization]`,
    placeholder: 'List core features, prioritize them, and explain the value of each...',
    helpText: 'Use MoSCoW method (Must/Should/Could/Won\'t) and tie each feature to user needs.'
  },
  metrics: {
    title: 'Success Metrics',
    description: 'Define how you\'ll measure success',
    template: `# Success Metrics

## Key Performance Indicators (KPIs)

### User Engagement
- [Metric]: [Target]
- [Metric]: [Target]

### Clinical/Health Outcomes
- [Metric]: [Target]
- [Metric]: [Target]

### Business Metrics
- [Metric]: [Target]
- [Metric]: [Target]

## Data Collection Strategy
[How will you gather these metrics?]

## Success Thresholds
**Minimum Viable:** [What defines basic success?]
**Target:** [What defines good success?]
**Stretch:** [What defines exceptional success?]`,
    placeholder: 'Define measurable outcomes for users, health, and business...',
    helpText: 'Focus on metrics that prove clinical value, user adoption, and business viability.'
  },
  regulatory: {
    title: 'Regulatory & Compliance',
    description: 'Address healthcare regulations and compliance',
    template: `# Regulatory & Compliance

## Regulatory Classification
[FDA classification, medical device category, or N/A]

## Compliance Requirements
- [ ] HIPAA Privacy & Security
- [ ] FDA regulations (if applicable)
- [ ] State-specific healthcare laws
- [ ] SOC 2 / HITRUST certification path
- [ ] Accessibility standards (WCAG)

## Data Handling
**PHI/PII:** [What protected health information will you handle?]
**Storage:** [Where and how will data be stored?]
**Access Controls:** [Who can access what data?]

## Risk Mitigation
[Key risks and how you'll address them]

## Clinical Validation Plan
[How will you prove clinical efficacy?]`,
    placeholder: 'Outline regulatory requirements, compliance needs, and risk mitigation...',
    helpText: 'Be thorough with HIPAA, FDA guidelines, and data security - critical for healthcare.'
  }
}

const REGULATORY_CHECKLIST = [
  { id: 'hipaa', label: 'HIPAA compliance plan documented', category: 'privacy' },
  { id: 'fda', label: 'FDA regulatory pathway identified', category: 'regulatory' },
  { id: 'phi', label: 'PHI handling procedures defined', category: 'privacy' },
  { id: 'security', label: 'Security measures specified', category: 'privacy' },
  { id: 'consent', label: 'User consent flows designed', category: 'privacy' },
  { id: 'validation', label: 'Clinical validation approach outlined', category: 'regulatory' }
]

export function PRDPhase({ journey, onComplete }: PRDPhaseProps) {
  const { language, t, isRTL } = useLanguage()
  const [activeSection, setActiveSection] = useState<SectionKey>('problem')
  const [sections, setSections] = useState<Record<SectionKey, PRDSection>>({
    problem: { title: 'Problem Statement', content: '', completed: false },
    solution: { title: 'Proposed Solution', content: '', completed: false },
    targetUsers: { title: 'Target Users', content: '', completed: false },
    features: { title: 'Core Features', content: '', completed: false },
    metrics: { title: 'Success Metrics', content: '', completed: false },
    regulatory: { title: 'Regulatory & Compliance', content: '', completed: false }
  })
  const [regulatoryChecklist, setRegulatoryChecklist] = useState<Record<string, boolean>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)

  useEffect(() => {
    if (journey.prd) {
      setSections(journey.prd.sections)
      const checklist: Record<string, boolean> = {}
      REGULATORY_CHECKLIST.forEach(item => {
        checklist[item.id] = journey.prd?.sections.regulatory.content.includes(item.label) || false
      })
      setRegulatoryChecklist(checklist)
    }
  }, [])

  const calculateCompleteness = () => {
    const sectionKeys = Object.keys(sections) as SectionKey[]
    const completedCount = sectionKeys.filter(key => sections[key].completed).length
    const contentCount = sectionKeys.filter(key => sections[key].content.trim().length > 100).length
    const checklistCount = Object.values(regulatoryChecklist).filter(Boolean).length
    
    const sectionScore = (completedCount / sectionKeys.length) * 50
    const contentScore = (contentCount / sectionKeys.length) * 30
    const checklistScore = (checklistCount / REGULATORY_CHECKLIST.length) * 20
    
    return Math.round(sectionScore + contentScore + checklistScore)
  }

  const completeness = calculateCompleteness()

  const handleContentChange = (section: SectionKey, content: string) => {
    setSections(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        content,
        completed: content.trim().length > 100
      }
    }))
  }

  const handleGenerateContent = async (section: SectionKey) => {
    setIsGenerating(true)
    try {
      const config = SECTION_CONFIG[section]
      const contextParts = []
      
      if (journey.concept) {
        contextParts.push(`Concept: ${journey.concept.problem}`)
        contextParts.push(`Target Users: ${journey.concept.targetUsers}`)
        contextParts.push(`Solution: ${journey.concept.solution}`)
      }
      
      if (journey.story) {
        contextParts.push(`Core Problem: ${journey.story.coreProblem}`)
        contextParts.push(`Impact: ${journey.story.impact}`)
        contextParts.push(`Solution Vision: ${journey.story.solutionVision}`)
      }
      
      if (journey.brand?.name) {
        contextParts.push(`Product Name: ${journey.brand.name}`)
        contextParts.push(`Tagline: ${journey.brand.tagline}`)
      }

      const context = contextParts.join('\n')
      const existingContent = sections[section].content.trim()
      const aiHelper = createAIHelper(language)
      
      let content: string
      if (existingContent) {
        content = await aiHelper.improvePRDSection(config.title, existingContent, context)
      } else {
        content = await aiHelper.suggestPRDContent(config.title, context)
      }
      
      handleContentChange(section, content.trim())
      toast.success(language === 'ar' ? 'تم توليد المحتوى بشخصية علامتك التجارية!' : 'Content generated with your brand personality!')
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل توليد المحتوى. يرجى المحاولة مجدداً.' : 'Failed to generate content. Please try again.')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleUseTemplate = (section: SectionKey) => {
    let template = SECTION_CONFIG[section].template
    
    if (journey.brand?.personality) {
      const personality = journey.brand.personality
      const archetype = personality.archetype.toLowerCase()
      
      if (archetype.includes('caregiver') && section === 'problem') {
        template = `# Problem Statement

## The Human Impact
[Describe how patients and caregivers are affected emotionally and physically]

## Current Challenges
- [Pain point affecting quality of care]
- [Burden on caregivers or patients]
- [Gaps in support and compassion]

## Real Stories
[Share a brief narrative or scenario showing the problem's impact]

## Why This Matters
[Connect to core values of empathy, care, and patient wellbeing]`
      } else if (archetype.includes('innovator') && section === 'solution') {
        template = `# Proposed Solution

## Revolutionary Approach
[Describe your breakthrough innovation and technology]

## How It Works
1. [Cutting-edge mechanism or methodology]
2. [Novel application of technology]
3. [Transformative outcome]

## Innovation Edge
- [Unique technological advantage]
- [First-to-market capabilities]
- [Future-forward features]

## Impact Metrics
[Quantifiable improvements and breakthrough results]`
      } else if (archetype.includes('hero') && section === 'problem') {
        template = `# Problem Statement

## The Crisis
[Define the urgent healthcare challenge that needs immediate action]

## Lives at Stake
- [Critical impact on patient outcomes]
- [Systemic failures causing harm]
- [Preventable tragedies]

## Current State of Affairs
[Present data showing the severity and urgency]

## Our Mission
[Bold statement about tackling this challenge head-on]`
      } else if (archetype.includes('sage') && section === 'solution') {
        template = `# Proposed Solution

## Evidence-Based Approach
[Describe solution grounded in research and clinical expertise]

## Methodology
1. [Research-backed process]
2. [Clinical validation approach]
3. [Knowledge-driven outcomes]

## Scientific Foundation
- [Research supporting the approach]
- [Expert consultation and validation]
- [Data-driven decision making]

## Educational Value
[How solution empowers users with knowledge and understanding]`
      }
    }
    
    handleContentChange(section, template)
    setShowTemplate(false)
    toast.success(t.prd.personalityTailoredTemplate)
  }

  const handleChecklistToggle = (id: string) => {
    setRegulatoryChecklist(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const handleExportPDF = () => {
    const prd: PRD = {
      sections,
      completeness,
      timestamp: Date.now()
    }

    try {
      exportPRDToPDF(prd, {
        brandName: journey.brand?.name,
        tagline: journey.brand?.tagline,
        personality: journey.brand?.personality,
        colors: journey.brand?.colors,
        language,
        isRTL
      })
      toast.success(language === 'ar' ? 'تم تصدير PDF بنجاح!' : 'PDF exported successfully!')
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل تصدير PDF. يرجى المحاولة مجدداً.' : 'Failed to export PDF. Please try again.')
      console.error(error)
    }
  }

  const handleComplete = () => {
    const prd: PRD = {
      sections,
      completeness,
      timestamp: Date.now()
    }

    const updatedJourney = { ...journey, prd }
    const completedJourney = completePhase(updatedJourney, 'prd')
    
    if (onComplete) {
      onComplete(completedJourney)
    }
    
    toast.success(language === 'ar' ? 'مرحلة وثيقة المتطلبات مكتملة! 🎉' : 'PRD phase complete! 🎉')
  }

  const getCompletenessLabel = () => {
    if (completeness >= 80) return t.prd.investorReady
    if (completeness >= 60) return t.prd.strongDraft
    if (completeness >= 40) return t.prd.inProgress
    return t.prd.gettingStarted
  }

  const getCompletenessColor = () => {
    if (completeness >= 80) return 'text-green-600'
    if (completeness >= 60) return 'text-blue-600'
    if (completeness >= 40) return 'text-yellow-600'
    return 'text-muted-foreground'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">{t.prd.title}</h1>
        <p className="text-lg text-muted-foreground">
          {t.prd.subtitle}
        </p>
      </div>

      {journey.brand?.personality && (
        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Sparkle className="w-6 h-6 text-accent" weight="fill" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {t.prd.writingWithPersonality} {journey.brand.personality.archetype} {t.prd.personality}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t.prd.aiContentMatch}
                </p>
                <div className="flex flex-wrap gap-2">
                  {journey.brand.personality.tone.map((tone) => (
                    <Badge key={tone} variant="secondary" className="capitalize text-xs">
                      {tone}
                    </Badge>
                  ))}
                  {journey.brand.personality.values.map((v) => (
                    <Badge key={v} variant="outline" className="capitalize text-xs">
                      {v}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">{t.prd.documentCompleteness}</p>
              <div className="flex items-center gap-3">
                <span className={`text-3xl font-bold ${getCompletenessColor()}`}>
                  {completeness}%
                </span>
                <Badge variant={completeness >= 80 ? 'default' : 'outline'} className="text-sm">
                  {getCompletenessLabel()}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <FileText className="w-12 h-12 text-primary/30" weight="duotone" />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={completeness < 20}
                className="gap-2"
              >
                <FilePdf weight="fill" className="w-4 h-4" />
                {t.prd.exportPDF}
              </Button>
            </div>
          </div>
          <Progress value={completeness} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {completeness >= 80 ? t.prd.prdReady : t.prd.completeAllSections}
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as SectionKey)}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto">
          {(Object.keys(SECTION_CONFIG) as SectionKey[]).map((key) => {
            const sectionTitleKey = `section${key.charAt(0).toUpperCase() + key.slice(1)}` as keyof typeof t.prd
            const sectionTitle = t.prd[sectionTitleKey] as string || SECTION_CONFIG[key].title
            
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {sections[key].completed ? (
                  <CheckCircle weight="fill" className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{sectionTitle}</span>
                <span className="sm:hidden">{key.slice(0, 4)}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {(Object.keys(SECTION_CONFIG) as SectionKey[]).map((sectionKey) => {
          const sectionTitleKey = `section${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)}` as keyof typeof t.prd
          const sectionTitle = t.prd[sectionTitleKey] as string || SECTION_CONFIG[sectionKey].title
          
          return (
            <TabsContent key={sectionKey} value={sectionKey} className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {sectionTitle}
                        {sections[sectionKey].completed && (
                          <CheckCircle weight="fill" className="w-5 h-5 text-green-600" />
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {SECTION_CONFIG[sectionKey].description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseTemplate(sectionKey)}
                      disabled={isGenerating}
                    >
                      {t.prd.useTemplate}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateContent(sectionKey)}
                      disabled={isGenerating}
                    >
                      <Sparkle className="mr-2" weight="fill" />
                      {sections[sectionKey].content.trim() ? t.prd.regenerateWithAI : t.prd.generateWithAI}
                    </Button>
                  </div>
                  <div className="mt-3 p-3 bg-muted/50 rounded-md">
                    <p className="text-xs text-muted-foreground">
                      💡 {SECTION_CONFIG[sectionKey].helpText}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    id={`prd-${sectionKey}`}
                    value={sections[sectionKey].content}
                    onChange={(e) => handleContentChange(sectionKey, e.target.value)}
                    placeholder={SECTION_CONFIG[sectionKey].placeholder}
                    className="min-h-[400px] font-mono text-sm"
                    disabled={isGenerating}
                  />

                  {sectionKey === 'regulatory' && (
                    <div className="mt-6 p-4 border rounded-lg space-y-4">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <CheckCircle weight="duotone" className="w-5 h-5 text-primary" />
                        {t.prd.regulatoryChecklist}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {REGULATORY_CHECKLIST.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 p-2 rounded hover:bg-muted/50">
                            <Checkbox
                              id={item.id}
                              checked={regulatoryChecklist[item.id] || false}
                              onCheckedChange={() => handleChecklistToggle(item.id)}
                            />
                            <label
                              htmlFor={item.id}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      {sections[sectionKey].content.trim().length} {t.prd.characters}
                      {sections[sectionKey].completed && (
                        <span className="ml-2 text-green-600 font-medium">✓ {t.prd.complete}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle>{t.prd.readyToProceed}</CardTitle>
          <CardDescription>
            {t.prd.completePRDDesc}
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button
            onClick={handleComplete}
            disabled={completeness < 40}
            className="w-full"
            size="lg"
          >
            {completeness < 40 ? (
              <>{t.prd.completeAtLeast40}</>
            ) : (
              <>
                {t.prd.completePRDPhase}
                <ArrowRight className="ml-2" weight="bold" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
