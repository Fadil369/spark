import { toast } from 'sonner'

export interface AIGenerationError {
  type: 'network' | 'rate_limit' | 'invalid_response' | 'timeout' | 'validation' | 'unknown'
  message: string
  originalError?: Error
  retryable: boolean
  suggestedAction?: string
  context?: Record<string, any>
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  exponentialBackoff: boolean
  onRetry?: (attemptNumber: number, error: AIGenerationError) => void
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialBackoff: true
}

export class AIGenerationErrorHandler {
  static parseError(error: any, context?: Record<string, any>): AIGenerationError {
    const errorMessage = error?.message || error?.toString() || 'Unknown error occurred'
    
    if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('NetworkError')) {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        originalError: error,
        retryable: true,
        suggestedAction: 'Check your internet connection and try again',
        context
      }
    }
    
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      return {
        type: 'rate_limit',
        message: 'AI service rate limit reached. Please wait a moment before trying again.',
        originalError: error,
        retryable: true,
        suggestedAction: 'Wait 30 seconds and try again, or try using simpler prompts',
        context
      }
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return {
        type: 'timeout',
        message: 'Request took too long to complete. The AI service may be busy.',
        originalError: error,
        retryable: true,
        suggestedAction: 'Try again in a few moments, or simplify your request',
        context
      }
    }
    
    if (errorMessage.includes('JSON') || errorMessage.includes('parse') || errorMessage.includes('SyntaxError')) {
      return {
        type: 'invalid_response',
        message: 'AI returned an unexpected format. This is usually temporary.',
        originalError: error,
        retryable: true,
        suggestedAction: 'Try regenerating - the AI will provide a valid response',
        context
      }
    }
    
    if (errorMessage.includes('empty') || errorMessage.includes('no response') || errorMessage.includes('undefined')) {
      return {
        type: 'invalid_response',
        message: 'AI returned an empty response. This is unusual.',
        originalError: error,
        retryable: true,
        suggestedAction: 'Try again with more specific details',
        context
      }
    }
    
    if (errorMessage.includes('missing') || errorMessage.includes('required') || errorMessage.includes('invalid')) {
      return {
        type: 'validation',
        message: errorMessage,
        originalError: error,
        retryable: false,
        suggestedAction: 'Please fill in all required fields and try again',
        context
      }
    }
    
    return {
      type: 'unknown',
      message: errorMessage,
      originalError: error,
      retryable: true,
      suggestedAction: 'Try again, or contact support if the issue persists',
      context
    }
  }

  static async retryWithBackoff<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: Record<string, any>
  ): Promise<T> {
    const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
    let lastError: AIGenerationError | null = null
    
    for (let attempt = 0; attempt <= fullConfig.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = this.parseError(error, { ...context, attemptNumber: attempt + 1 })
        
        if (!lastError.retryable || attempt === fullConfig.maxRetries) {
          throw lastError
        }
        
        const delay = fullConfig.exponentialBackoff
          ? Math.min(fullConfig.baseDelay * Math.pow(2, attempt), fullConfig.maxDelay)
          : fullConfig.baseDelay
        
        if (fullConfig.onRetry) {
          fullConfig.onRetry(attempt + 1, lastError)
        }
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }

  static showUserFriendlyError(error: AIGenerationError, language: 'en' | 'ar' = 'en') {
    const messages = {
      en: {
        network: '🌐 Connection Issue',
        rate_limit: '⏱️ Rate Limit Reached',
        invalid_response: '🔄 Unexpected Response',
        timeout: '⏰ Request Timeout',
        validation: '⚠️ Validation Error',
        unknown: '❌ Generation Failed'
      },
      ar: {
        network: '🌐 مشكلة في الاتصال',
        rate_limit: '⏱️ تم الوصول إلى حد المعدل',
        invalid_response: '🔄 استجابة غير متوقعة',
        timeout: '⏰ انتهت مهلة الطلب',
        validation: '⚠️ خطأ في التحقق',
        unknown: '❌ فشل التوليد'
      }
    }
    
    const title = messages[language][error.type]
    const message = language === 'ar' && error.type !== 'validation'
      ? this.translateErrorToArabic(error)
      : error.message
    
    toast.error(`${title}\n${message}`, {
      duration: 5000,
      description: error.suggestedAction
    })
  }

  static translateErrorToArabic(error: AIGenerationError): string {
    const translations: Record<string, string> = {
      'Network connection failed. Please check your internet connection.': 'فشل الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.',
      'AI service rate limit reached. Please wait a moment before trying again.': 'تم الوصول إلى حد معدل خدمة الذكاء الاصطناعي. يرجى الانتظار لحظة قبل المحاولة مرة أخرى.',
      'Request took too long to complete. The AI service may be busy.': 'استغرق الطلب وقتًا طويلاً جدًا لإكماله. قد تكون خدمة الذكاء الاصطناعي مشغولة.',
      'AI returned an unexpected format. This is usually temporary.': 'أرجع الذكاء الاصطناعي تنسيقًا غير متوقع. هذا عادة ما يكون مؤقتًا.',
      'AI returned an empty response. This is unusual.': 'أرجع الذكاء الاصطناعي استجابة فارغة. هذا غير عادي.'
    }
    
    return translations[error.message] || error.message
  }

  static logError(error: AIGenerationError, additionalContext?: Record<string, any>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: error.type,
      message: error.message,
      retryable: error.retryable,
      suggestedAction: error.suggestedAction,
      context: { ...error.context, ...additionalContext },
      stack: error.originalError?.stack
    }
    
    console.error('[AI Generation Error]', logEntry)
    
    return logEntry
  }
}

export async function safeAICall<T>(
  operation: () => Promise<T>,
  fallback?: T,
  config?: Partial<RetryConfig>,
  context?: Record<string, any>
): Promise<T | undefined> {
  try {
    return await AIGenerationErrorHandler.retryWithBackoff(operation, config, context)
  } catch (error) {
    const parsedError = AIGenerationErrorHandler.parseError(error, context)
    AIGenerationErrorHandler.logError(parsedError)
    
    if (fallback !== undefined) {
      return fallback
    }
    
    throw parsedError
  }
}

export function createRetryToast(attemptNumber: number, maxRetries: number, error: AIGenerationError, language: 'en' | 'ar' = 'en') {
  const messages = {
    en: `Retry ${attemptNumber}/${maxRetries}: ${error.message}`,
    ar: `إعادة المحاولة ${attemptNumber}/${maxRetries}: ${error.message}`
  }
  
  toast.loading(messages[language], {
    duration: 2000,
    description: language === 'en' 
      ? `Automatically retrying in a moment...` 
      : 'إعادة المحاولة تلقائيًا خلال لحظة...'
  })
}

export function getErrorRecoveryOptions(error: AIGenerationError, language: 'en' | 'ar' = 'en') {
  const optionsMap = {
    en: {
      network: [
        { label: 'Check Connection', action: 'check_connection', description: 'Verify your internet is working' },
        { label: 'Try Again', action: 'retry', description: 'Attempt the operation again' },
        { label: 'Use Offline Mode', action: 'offline', description: 'Continue without AI assistance' }
      ],
      rate_limit: [
        { label: 'Wait & Retry', action: 'wait_retry', description: 'Wait 30 seconds and try again' },
        { label: 'Simplify Request', action: 'simplify', description: 'Use a shorter prompt' },
        { label: 'Manual Input', action: 'manual', description: 'Enter content manually' }
      ],
      invalid_response: [
        { label: 'Regenerate', action: 'retry', description: 'Generate again with same prompt' },
        { label: 'Modify Prompt', action: 'modify', description: 'Change your input' },
        { label: 'Use Template', action: 'template', description: 'Start from a template' }
      ],
      timeout: [
        { label: 'Retry', action: 'retry', description: 'Try again immediately' },
        { label: 'Simplify', action: 'simplify', description: 'Reduce complexity' },
        { label: 'Try Later', action: 'later', description: 'Come back when service is less busy' }
      ],
      validation: [
        { label: 'Review Input', action: 'review', description: 'Check all fields are filled' },
        { label: 'Reset Form', action: 'reset', description: 'Start over' }
      ],
      unknown: [
        { label: 'Try Again', action: 'retry', description: 'Retry the operation' },
        { label: 'Report Issue', action: 'report', description: 'Contact support' },
        { label: 'Manual Mode', action: 'manual', description: 'Continue without AI' }
      ]
    },
    ar: {
      network: [
        { label: 'فحص الاتصال', action: 'check_connection', description: 'تحقق من عمل الإنترنت' },
        { label: 'حاول مرة أخرى', action: 'retry', description: 'حاول العملية مرة أخرى' },
        { label: 'استخدم وضع عدم الاتصال', action: 'offline', description: 'تابع بدون مساعدة الذكاء الاصطناعي' }
      ],
      rate_limit: [
        { label: 'انتظر وأعد المحاولة', action: 'wait_retry', description: 'انتظر 30 ثانية وحاول مرة أخرى' },
        { label: 'بسّط الطلب', action: 'simplify', description: 'استخدم طلبًا أقصر' },
        { label: 'إدخال يدوي', action: 'manual', description: 'أدخل المحتوى يدويًا' }
      ],
      invalid_response: [
        { label: 'أعد التوليد', action: 'retry', description: 'ولّد مرة أخرى بنفس الطلب' },
        { label: 'عدّل الطلب', action: 'modify', description: 'غيّر مدخلاتك' },
        { label: 'استخدم قالبًا', action: 'template', description: 'ابدأ من قالب' }
      ],
      timeout: [
        { label: 'أعد المحاولة', action: 'retry', description: 'حاول مرة أخرى فورًا' },
        { label: 'بسّط', action: 'simplify', description: 'قلل التعقيد' },
        { label: 'حاول لاحقًا', action: 'later', description: 'عد عندما تكون الخدمة أقل انشغالًا' }
      ],
      validation: [
        { label: 'راجع المدخلات', action: 'review', description: 'تحقق من ملء جميع الحقول' },
        { label: 'أعد تعيين النموذج', action: 'reset', description: 'ابدأ من جديد' }
      ],
      unknown: [
        { label: 'حاول مرة أخرى', action: 'retry', description: 'أعد تنفيذ العملية' },
        { label: 'أبلغ عن مشكلة', action: 'report', description: 'اتصل بالدعم' },
        { label: 'الوضع اليدوي', action: 'manual', description: 'تابع بدون الذكاء الاصطناعي' }
      ]
    }
  }
  
  return optionsMap[language][error.type] || optionsMap[language].unknown
}
