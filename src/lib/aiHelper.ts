import { Language } from './i18n'

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
    const languageInstruction = this.language === 'ar' 
      ? 'Generate the concepts in Arabic language.' 
      : 'Generate the concepts in English language.'
    
    const prompt = window.spark.llmPrompt`You are a healthcare startup advisor. Based on these healthcare problems or themes: "${input}", generate 8 related healthcare concepts, keywords, or problem areas. ${languageInstruction} Return a JSON object with a single property "keywords" that contains an array of short phrases (2-4 words each).`
    
    const response = await window.spark.llm(prompt, this.defaultModel, true)
    const data = JSON.parse(response)
    return data.keywords || []
  }

  async refineConcept(input: string, keywords: string[]): Promise<{
    problem: string
    targetUsers: string
    solution: string
  }> {
    const allKeywords = [input, ...keywords].join(', ')
    const languageInstruction = this.language === 'ar' 
      ? 'Generate the concept in Arabic language with clear, professional healthcare terminology.' 
      : 'Generate the concept in English language.'
    
    const prompt = window.spark.llmPrompt`You are a healthcare startup advisor. Based on these healthcare themes: "${allKeywords}", create a structured startup concept. ${languageInstruction} Return a JSON object with:
    - problem: A clear 1-2 sentence description of the healthcare problem
    - targetUsers: Who is affected (e.g., "elderly diabetic patients", "primary care physicians")
    - solution: A 2-3 sentence proposed solution vision
    Make it specific to healthcare and actionable.`
    
    const response = await window.spark.llm(prompt, this.defaultModel, true)
    const data = JSON.parse(response)
    return {
      problem: data.problem,
      targetUsers: data.targetUsers,
      solution: data.solution
    }
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
    const toneDescription = params.tone === 'empathetic'
      ? 'warm, human-centered storytelling emphasizing patient experiences and emotional impact'
      : 'data-driven narrative focusing on evidence, clinical outcomes, and systemic solutions'
    
    const languageInstruction = this.language === 'ar' 
      ? 'Write the story in Arabic language with eloquent and professional healthcare terminology.' 
      : 'Write the story in English language.'
    
    const prompt = window.spark.llmPrompt`You are a healthcare startup storyteller. Create a compelling founder story using this information:

Context: ${params.problem}
Target: ${params.targetUsers}
Solution: ${params.solution}
Patient: ${params.targetPatient}
Core Problem: ${params.coreProblem}
Impact: ${params.realWorldImpact}
Vision: ${params.solutionVision}

Tone: ${toneDescription}
${languageInstruction}

Write a cohesive 3-4 paragraph founder narrative that connects these elements emotionally and logically. Make it inspiring and authentic.`
    
    const response = await window.spark.llm(prompt, 'gpt-4o', false)
    return response
  }

  async scoreStory(story: string): Promise<{
    clarity: number
    emotion: number
    healthcare: number
  }> {
    const prompt = window.spark.llmPrompt`You are an expert evaluator of healthcare startup narratives. Analyze this founder story and rate it on three dimensions (0-100):

Story: "${story}"

Return a JSON object with:
- clarity: How clear and coherent is the narrative? (0-100)
- emotion: How emotionally engaging is it? (0-100)
- healthcare: How well does it address healthcare-specific challenges? (0-100)

Be critical but fair. Most good stories score 65-85.`
    
    const response = await window.spark.llm(prompt, this.defaultModel, true)
    const data = JSON.parse(response)
    return {
      clarity: Math.min(100, Math.max(0, data.clarity || 70)),
      emotion: Math.min(100, Math.max(0, data.emotion || 70)),
      healthcare: Math.min(100, Math.max(0, data.healthcare || 70))
    }
  }

  async generateBrandName(personality: {
    archetype: string
    tone: string[]
    values: string[]
    targetFeeling: string
  }, concept: string): Promise<string[]> {
    const languageInstruction = this.language === 'ar' 
      ? 'Generate creative Arabic or bilingual (Arabic-English) brand names suitable for healthcare.' 
      : 'Generate creative English brand names suitable for healthcare.'
    
    const prompt = window.spark.llmPrompt`You are a healthcare branding expert. Based on this brand personality:
    
Archetype: ${personality.archetype}
Tone: ${personality.tone.join(', ')}
Values: ${personality.values.join(', ')}
Target Feeling: ${personality.targetFeeling}
Concept: ${concept}

${languageInstruction}

Generate 6 unique, memorable healthcare brand names. Return a JSON object with a single property "names" containing an array of name strings. Names should be professional, memorable, and suitable for a healthcare startup.`
    
    const response = await window.spark.llm(prompt, this.defaultModel, true)
    const data = JSON.parse(response)
    return data.names || []
  }

  async generateTaglines(brandName: string, concept: string): Promise<string[]> {
    const languageInstruction = this.language === 'ar' 
      ? 'Generate taglines in Arabic that are concise and impactful.' 
      : 'Generate taglines in English.'
    
    const prompt = window.spark.llmPrompt`You are a healthcare branding expert. For the brand "${brandName}" with this concept: "${concept}", generate 5 compelling taglines. ${languageInstruction} Return a JSON object with a single property "taglines" containing an array of tagline strings. Each tagline should be 3-7 words, memorable, and healthcare-focused.`
    
    const response = await window.spark.llm(prompt, this.defaultModel, true)
    const data = JSON.parse(response)
    return data.taglines || []
  }

  async improvePRDSection(sectionTitle: string, currentContent: string, context: string): Promise<string> {
    const languageInstruction = this.language === 'ar' 
      ? 'Improve the content in Arabic with professional healthcare and technical terminology.' 
      : 'Improve the content in English.'
    
    const prompt = window.spark.llmPrompt`You are a healthcare product expert. Improve this PRD section:

Section: ${sectionTitle}
Current Content: "${currentContent}"
Product Context: "${context}"

${languageInstruction}

Provide an enhanced version that is more detailed, actionable, and healthcare-specific. Focus on clarity and completeness. Return only the improved content, not explanations.`
    
    const response = await window.spark.llm(prompt, 'gpt-4o', false)
    return response.trim()
  }

  async suggestPRDContent(sectionTitle: string, context: string): Promise<string> {
    const languageInstruction = this.language === 'ar' 
      ? 'Generate the content in Arabic with professional healthcare and technical terminology.' 
      : 'Generate the content in English.'
    
    const prompt = window.spark.llmPrompt`You are a healthcare product expert. Generate content for this PRD section:

Section: ${sectionTitle}
Product Context: "${context}"

${languageInstruction}

Write a comprehensive, actionable section focused on healthcare specifics. Be detailed and practical. Return only the content, not explanations.`
    
    const response = await window.spark.llm(prompt, 'gpt-4o', false)
    return response.trim()
  }
}

export const createAIHelper = (language: Language = 'en') => new AIHelper(language)
