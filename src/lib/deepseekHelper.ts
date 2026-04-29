import { RateLimiter, formatTimeRemaining } from './rateLimiter'

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions'

function validateApiKey(): void {
  if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY === 'your_deepseek_api_key_here') {
    throw new Error(
      'DeepSeek API key is not configured. Please add VITE_DEEPSEEK_API_KEY to your .env file. ' +
      'Get your API key from https://platform.deepseek.com'
    )
  }
}

export interface DeepSeekResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function callDeepSeek(
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 2000,
  jsonMode: boolean = false,
  endpoint: string = 'default'
): Promise<string> {
  const rateLimiter = new RateLimiter(endpoint)

  try {
    validateApiKey()
    
    // Gracefully skip rate limit check if it fails
    let limitCheck = { allowed: true, remaining: 999 }
    try {
      limitCheck = await rateLimiter.checkLimit()
    } catch {
      console.warn('Rate limiter check failed, proceeding anyway')
    }
    
    if (!limitCheck.allowed) {
      try { await rateLimiter.recordBlocked() } catch {}
      const timeRemaining = formatTimeRemaining((limitCheck as any).retryAfter || 0)
      throw new Error(
        `Rate limit exceeded for ${endpoint}. Please wait ${timeRemaining} before trying again. ` +
        `(${limitCheck.remaining} requests remaining)`
      )
    }

    try { await rateLimiter.recordRequest() } catch {}
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    const response = await fetch(DEEPSEEK_API_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI assistant specializing in healthcare technology, startup development, and user experience design. Be concise and direct.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature,
        max_tokens: Math.min(maxTokens, 8000),
        ...(jsonMode && { response_format: { type: 'json_object' } })
      })
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      // try { await rateLimiter.recordUsage(false)
      throw new Error(`DeepSeek API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data: DeepSeekResponse = await response.json()
    const content = data.choices[0]?.message?.content || ''
    
    if (!content) {
      // try { await rateLimiter.recordUsage(false)
      throw new Error('Empty response from DeepSeek API')
    }

    try { await rateLimiter.recordUsage(true, {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens
    }) } catch {}

    return content
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === 'AbortError'
    const errMsg = isAbort ? 'Request timed out after 60s' : (error instanceof Error ? error.message : String(error))
    console.error('DeepSeek API call failed:', errMsg)
    throw new Error(`${isAbort ? 'Timeout' : 'API Error'}: ${errMsg}`)
  }
}

function cleanJsonResponse(content: string): string {
  let cleaned = content.trim()
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  
  return cleaned.trim()
}

export interface CodeValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
  quality: {
    structure: number
    security: number
    performance: number
    accessibility: number
    overall: number
  }
}

export interface CodeEnhancement {
  enhancedCode: string
  improvements: string[]
  explanations: string[]
}

export async function generatePersonalizedConcepts(
  userInput: string,
  language: 'en' | 'ar'
): Promise<string[]> {
  const languageInstruction = language === 'ar'
    ? 'Generate healthcare concepts in Arabic with professional terminology.'
    : 'Generate healthcare concepts in English.'

  const prompt = `Based on this healthcare idea or problem: "${userInput}"

${languageInstruction}

Generate 8 related, specific healthcare concepts or problem areas. Make each concept:
- Actionable and specific
- Relevant to real healthcare challenges
- 2-4 words per concept

Return a JSON object:
{
  "concepts": ["array of 8 healthcare concept phrases"]
}`

  const content = await callDeepSeek(prompt, 0.8, 1000, true, 'concepts')
  const cleaned = cleanJsonResponse(content)
  const result = JSON.parse(cleaned)
  
  return Array.isArray(result.concepts) ? result.concepts : []
}

export async function refineConceptWithAI(
  userInput: string,
  selectedKeywords: string[],
  language: 'en' | 'ar'
): Promise<{ problem: string; targetUsers: string; solution: string }> {
  const languageInstruction = language === 'ar'
    ? 'Write in professional Arabic suitable for healthcare.'
    : 'Write in clear, professional English.'

  const allContext = [userInput, ...selectedKeywords].join(', ')

  const prompt = `Based on these healthcare themes: "${allContext}"

${languageInstruction}

Create a structured startup concept with:
- problem: Clear 1-2 sentence healthcare problem description
- targetUsers: Specific user personas (e.g., "elderly diabetic patients", "oncology nurses")
- solution: 2-3 sentence proposed solution vision

Return a JSON object:
{
  "problem": "...",
  "targetUsers": "...",
  "solution": "..."
}`

  const content = await callDeepSeek(prompt, 0.7, 1500, true, 'refine')
  const cleaned = cleanJsonResponse(content)
  const result = JSON.parse(cleaned)
  
  return {
    problem: result.problem || '',
    targetUsers: result.targetUsers || '',
    solution: result.solution || ''
  }
}

export async function generatePersonalizedStory(
  concept: { problem: string; targetUsers: string; solution: string },
  storyParams: {
    tone: 'empathetic' | 'scientific'
    targetPatient: string
    coreProblem: string
    impact: string
    vision: string
  },
  language: 'en' | 'ar'
): Promise<string> {
  const toneDesc = storyParams.tone === 'empathetic'
    ? 'warm, human-centered, emphasizing patient experiences'
    : 'data-driven, clinical, focusing on evidence and outcomes'

  const languageInstruction = language === 'ar'
    ? 'Write an eloquent, professional founder story in Arabic.'
    : 'Write a compelling founder story in English.'

  const prompt = `Create a healthcare startup founder story with this context:

Problem: ${concept.problem}
Target Users: ${concept.targetUsers}
Solution: ${concept.solution}
Patient Focus: ${storyParams.targetPatient}
Core Challenge: ${storyParams.coreProblem}
Real Impact: ${storyParams.impact}
Vision: ${storyParams.vision}

Tone: ${toneDesc}
${languageInstruction}

Write a cohesive, inspiring 3-4 paragraph narrative that connects these elements authentically. Make it emotionally engaging and credible.`

  return await callDeepSeek(prompt, 0.8, 2000, false, 'story')
}

export async function validateCodeWithDeepSeek(
  code: string,
  language: string,
  context?: string
): Promise<CodeValidationResult> {
  const prompt = `Analyze this ${language} code for healthcare application quality, security, and compliance.

${context ? `Context: ${context}\n\n` : ''}Code:
\`\`\`${language}
${code}
\`\`\`

Evaluate and return JSON:
{
  "isValid": boolean,
  "errors": ["critical issues"],
  "warnings": ["potential issues"],
  "suggestions": ["improvements"],
  "quality": {
    "structure": 0-100,
    "security": 0-100,
    "performance": 0-100,
    "accessibility": 0-100,
    "overall": 0-100
  }
}

Focus on: HIPAA compliance, accessibility (WCAG 2.1 AA), performance, security (XSS, CSRF, injection), maintainability.`

  const content = await callDeepSeek(prompt, 0.3, 2000, true, 'code-validate')
  const cleaned = cleanJsonResponse(content)
  const result = JSON.parse(cleaned)
  
  return {
    isValid: result.isValid ?? true,
    errors: Array.isArray(result.errors) ? result.errors : [],
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    quality: {
      structure: result.quality?.structure ?? 70,
      security: result.quality?.security ?? 70,
      performance: result.quality?.performance ?? 70,
      accessibility: result.quality?.accessibility ?? 70,
      overall: result.quality?.overall ?? 70
    }
  }
}

export async function enhanceCodeWithDeepSeek(
  code: string,
  language: string,
  enhancementGoals: string[]
): Promise<CodeEnhancement> {
  const goalsText = enhancementGoals.join(', ')
  
  const prompt = `Enhance this ${language} code to improve: ${goalsText}

Original Code:
\`\`\`${language}
${code}
\`\`\`

Goals:
${enhancementGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Return JSON:
{
  "enhancedCode": "improved code",
  "improvements": ["specific improvements"],
  "explanations": ["detailed explanations"]
}

Focus on: healthcare best practices, HIPAA, accessibility, performance, modern patterns, maintainability.`

  const content = await callDeepSeek(prompt, 0.4, 4000, true, 'code-enhance')
  const cleaned = cleanJsonResponse(content)
  const result = JSON.parse(cleaned)
  
  return {
    enhancedCode: result.enhancedCode || code,
    improvements: Array.isArray(result.improvements) ? result.improvements : [],
    explanations: Array.isArray(result.explanations) ? result.explanations : []
  }
}

export async function generateCodeSuggestions(
  code: string,
  language: string,
  framework?: string
): Promise<string[]> {
  const prompt = `Analyze this ${language}${framework ? ` (${framework})` : ''} code for healthcare applications.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide 5-7 specific, actionable improvement suggestions. Return JSON:
{
  "suggestions": ["array of actionable suggestions"]
}

Focus on: healthcare data security, accessibility, performance, modern best practices, UX enhancements.`

  const content = await callDeepSeek(prompt, 0.5, 1500, true, 'analysis')
  const cleaned = cleanJsonResponse(content)
  const result = JSON.parse(cleaned)
  
  return Array.isArray(result.suggestions) ? result.suggestions : []
}

export async function generateBrandNames(
  personality: {
    archetype: string
    tone: string[]
    values: string[]
    targetFeeling: string
  },
  concept: string,
  language: 'en' | 'ar'
): Promise<string[]> {
  const languageInstruction = language === 'ar'
    ? 'Generate creative Arabic or bilingual (Arabic-English) brand names.'
    : 'Generate creative, memorable English brand names.'

  const prompt = `Create healthcare brand names based on:

Archetype: ${personality.archetype}
Tone: ${personality.tone.join(', ')}
Values: ${personality.values.join(', ')}
Target Feeling: ${personality.targetFeeling}
Concept: ${concept}

${languageInstruction}

Generate 6 unique, professional, memorable healthcare brand names. Return JSON:
{
  "names": ["array of 6 brand names"]
}`

  const content = await callDeepSeek(prompt, 0.9, 1000, true, 'brand')
  const cleaned = cleanJsonResponse(content)
  const result = JSON.parse(cleaned)
  
  return Array.isArray(result.names) ? result.names : []
}

export async function generateTaglines(
  brandName: string,
  concept: string,
  language: 'en' | 'ar'
): Promise<string[]> {
  const languageInstruction = language === 'ar'
    ? 'Generate concise, impactful taglines in Arabic.'
    : 'Generate concise, impactful taglines in English.'

  const prompt = `For brand "${brandName}" with concept: "${concept}"

${languageInstruction}

Generate 5 compelling taglines. Each should be 3-7 words, memorable, healthcare-focused. Return JSON:
{
  "taglines": ["array of 5 taglines"]
}`

  const content = await callDeepSeek(prompt, 0.8, 800, true, 'tagline')
  const cleaned = cleanJsonResponse(content)
  const result = JSON.parse(cleaned)
  
  return Array.isArray(result.taglines) ? result.taglines : []
}

export async function generatePRDContent(
  sectionTitle: string,
  context: string,
  currentContent: string,
  language: 'en' | 'ar',
  isImprovement: boolean = false
): Promise<string> {
  const languageInstruction = language === 'ar'
    ? 'Write in professional Arabic with healthcare and technical terminology.'
    : 'Write in clear, professional English.'

  const prompt = isImprovement
    ? `Improve this PRD section:

Section: ${sectionTitle}
Current Content: "${currentContent}"
Product Context: "${context}"

${languageInstruction}

Provide enhanced content that is more detailed, actionable, and healthcare-specific. Focus on clarity and completeness.`
    : `Generate content for this PRD section:

Section: ${sectionTitle}
Product Context: "${context}"

${languageInstruction}

Write comprehensive, actionable content focused on healthcare specifics. Be detailed and practical.`

  return await callDeepSeek(prompt, 0.7, 2000, false, 'prd')
}

export async function analyzeStoryQuality(story: string): Promise<{
  clarity: number
  emotion: number
  healthcare: number
}> {
  const prompt = `Evaluate this healthcare startup founder story:

"${story}"

Rate on three dimensions (0-100):
- clarity: How clear and coherent?
- emotion: How emotionally engaging?
- healthcare: How well does it address healthcare challenges?

Return JSON:
{
  "clarity": 0-100,
  "emotion": 0-100,
  "healthcare": 0-100
}

Be critical but fair. Most good stories score 65-85.`

  const content = await callDeepSeek(prompt, 0.3, 500, true, 'analysis')
  const cleaned = cleanJsonResponse(content)
  const result = JSON.parse(cleaned)
  
  return {
    clarity: Math.min(100, Math.max(0, result.clarity || 70)),
    emotion: Math.min(100, Math.max(0, result.emotion || 70)),
    healthcare: Math.min(100, Math.max(0, result.healthcare || 70))
  }
}

export async function improveStory(
  originalStory: string,
  improvements: string[],
  language: 'en' | 'ar'
): Promise<string> {
  const languageInstruction = language === 'ar'
    ? 'Write the improved story in professional Arabic.'
    : 'Write the improved story in clear, professional English.'

  const improvementsText = improvements.join(', ')
  
  const prompt = `Improve this healthcare startup founder story by focusing on: ${improvementsText}

Original Story:
"${originalStory}"

${languageInstruction}

Create an enhanced version that addresses the improvement areas while maintaining the core message and authenticity. Make it more compelling and engaging.`

  return await callDeepSeek(prompt, 0.7, 2500, false, 'story-improve')
}

export async function translateStory(
  story: string,
  targetLanguage: 'en' | 'ar'
): Promise<string> {
  const languageInstruction = targetLanguage === 'ar'
    ? 'Translate to professional, eloquent Arabic suitable for healthcare business contexts. Maintain the emotional impact and narrative flow.'
    : 'Translate to clear, professional English. Maintain the emotional impact and narrative flow.'

  const prompt = `Translate this healthcare startup founder story:

"${story}"

${languageInstruction}

Ensure the translation captures the essence, emotion, and professional tone of the original.`

  return await callDeepSeek(prompt, 0.5, 2500, false, 'translate')
}
