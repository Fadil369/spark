const DEEPSEEK_API_KEY = 'sk-21e093bd78c7478e92e1f8cc681dfe5f'
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

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

export async function validateCodeWithDeepSeek(
  code: string,
  language: string,
  context?: string
): Promise<CodeValidationResult> {
  try {
    const prompt = `You are an expert code validator specializing in healthcare applications. Analyze this ${language} code for quality, security, and healthcare compliance.

${context ? `Context: ${context}\n\n` : ''}Code to validate:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive validation report in JSON format:
{
  "isValid": boolean,
  "errors": ["critical issues that must be fixed"],
  "warnings": ["potential issues to address"],
  "suggestions": ["improvement recommendations"],
  "quality": {
    "structure": 0-100,
    "security": 0-100,
    "performance": 0-100,
    "accessibility": 0-100,
    "overall": 0-100
  }
}

Focus on:
- Healthcare data security and HIPAA compliance
- Accessibility (WCAG 2.1 AA)
- Performance and optimization
- Code structure and maintainability
- Common vulnerabilities (XSS, CSRF, injection)

Return ONLY the JSON object, no markdown formatting.`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data: DeepSeekResponse = await response.json()
    const content = data.choices[0]?.message?.content || '{}'
    
    let cleanContent = content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7)
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3)
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3)
    }
    
    const result = JSON.parse(cleanContent.trim())
    
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
  } catch (error) {
    console.error('DeepSeek validation error:', error)
    throw new Error(`Code validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function enhanceCodeWithDeepSeek(
  code: string,
  language: string,
  enhancementGoals: string[]
): Promise<CodeEnhancement> {
  try {
    const goalsText = enhancementGoals.join(', ')
    
    const prompt = `You are an expert code enhancement specialist for healthcare applications. Enhance this ${language} code to improve: ${goalsText}.

Original Code:
\`\`\`${language}
${code}
\`\`\`

Enhancement Goals:
${enhancementGoals.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Provide enhanced code with detailed improvements in JSON format:
{
  "enhancedCode": "the complete enhanced code",
  "improvements": ["list of specific improvements made"],
  "explanations": ["detailed explanations for each improvement"]
}

Focus on:
- Healthcare-specific best practices
- Security and compliance (HIPAA)
- Accessibility improvements
- Performance optimizations
- Modern design patterns
- Clean, maintainable code

Return ONLY the JSON object, no markdown formatting.`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 4000
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data: DeepSeekResponse = await response.json()
    const content = data.choices[0]?.message?.content || '{}'
    
    let cleanContent = content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7)
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3)
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3)
    }
    
    const result = JSON.parse(cleanContent.trim())
    
    return {
      enhancedCode: result.enhancedCode || code,
      improvements: Array.isArray(result.improvements) ? result.improvements : [],
      explanations: Array.isArray(result.explanations) ? result.explanations : []
    }
  } catch (error) {
    console.error('DeepSeek enhancement error:', error)
    throw new Error(`Code enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function generateCodeSuggestions(
  code: string,
  language: string,
  framework?: string
): Promise<string[]> {
  try {
    const prompt = `You are a code improvement expert for healthcare applications. Analyze this ${language}${framework ? ` (${framework})` : ''} code and provide 5-7 specific, actionable improvement suggestions.

Code:
\`\`\`${language}
${code}
\`\`\`

Return a JSON object:
{
  "suggestions": ["array of specific, actionable suggestions"]
}

Focus on:
- Healthcare data security
- Accessibility improvements
- Performance optimizations
- Modern best practices
- User experience enhancements

Return ONLY the JSON object, no markdown formatting.`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
    }

    const data: DeepSeekResponse = await response.json()
    const content = data.choices[0]?.message?.content || '{}'
    
    let cleanContent = content.trim()
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.slice(7)
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.slice(3)
    }
    if (cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(0, -3)
    }
    
    const result = JSON.parse(cleanContent.trim())
    
    return Array.isArray(result.suggestions) ? result.suggestions : []
  } catch (error) {
    console.error('DeepSeek suggestions error:', error)
    throw new Error(`Suggestion generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
