import { Language } from './i18n'
import {
  generatePersonalizedConcepts,
  refineConceptWithAI,
  generatePersonalizedStory,
  analyzeStoryQuality,
  improveStory,
  translateStory,
  generateBrandNames,
  generateTaglines,
  generatePRDContent
} from './deepseekHelper'

export interface AIHelperOptions {
  language?: Language
  model?: 'gpt-4o' | 'gpt-4o-mini'
  jsonMode?: boolean
}

export class AIHelper {
  private language: Language
  private defaultModel: 'gpt-4o' | 'gpt-4o-mini'

  constructor(language: Language = 'en') {
    this.language = language
    this.defaultModel = 'gpt-4o-mini'
  }

  setLanguage(language: Language) {
    this.language = language
  }

  async generateHealthcareConcepts(input: string): Promise<string[]> {
    try {
      if (!input || input.trim().length === 0) {
        throw new Error('Input text is required to generate healthcare concepts')
      }

      return await generatePersonalizedConcepts(input, this.language)
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse AI response as JSON. Raw response: ${error.message}`)
      }
      throw new Error(`Healthcare concept generation failed: ${error.message || 'Unknown error'}`)
    }
  }

  async refineConcept(input: string, keywords: string[]): Promise<{
    problem: string
    targetUsers: string
    solution: string
  }> {
    return await refineConceptWithAI(input, keywords, this.language)
  }

  async generateFounderStory(params: {
    problem: string
    targetUsers: string
    solution: string
    tone: 'empathetic' | 'scientific'
    targetPatient: string
    coreProblem: string
    realWorldImpact: string
    solutionVision: string
  }): Promise<string> {
    const concept = {
      problem: params.problem,
      targetUsers: params.targetUsers,
      solution: params.solution
    }

    const storyParams = {
      tone: params.tone,
      targetPatient: params.targetPatient,
      coreProblem: params.coreProblem,
      impact: params.realWorldImpact,
      vision: params.solutionVision
    }

    return await generatePersonalizedStory(concept, storyParams, this.language)
  }

  async scoreStory(story: string): Promise<{
    clarity: number
    emotion: number
    healthcare: number
  }> {
    return await analyzeStoryQuality(story)
  }

  async improveStory(story: string, improvements: string[]): Promise<string> {
    return await improveStory(story, improvements, this.language)
  }

  async translateStory(story: string, targetLanguage: Language): Promise<string> {
    return await translateStory(story, targetLanguage)
  }

  async generateBrandName(personality: {
    archetype: string
    tone: string[]
    values: string[]
    targetFeeling: string
  }, concept: string): Promise<string[]> {
    return await generateBrandNames(personality, concept, this.language)
  }

  async generateTaglines(brandName: string, concept: string): Promise<string[]> {
    return await generateTaglines(brandName, concept, this.language)
  }

  async improvePRDSection(sectionTitle: string, currentContent: string, context: string): Promise<string> {
    return await generatePRDContent(sectionTitle, context, currentContent, this.language, true)
  }

  async suggestPRDContent(sectionTitle: string, context: string): Promise<string> {
    return await generatePRDContent(sectionTitle, context, '', this.language, false)
  }
}

export const createAIHelper = (language: Language = 'en') => new AIHelper(language)
