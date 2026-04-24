import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Warning, ArrowClockwise, ArrowRight, Wrench, FileText } from '@phosphor-icons/react'
import { AIGenerationError, getErrorRecoveryOptions } from '@/lib/errorRecovery'
import { useState } from 'react'

interface ErrorRecoveryDialogProps {
  open: boolean
  error: AIGenerationError | null
  language?: 'en' | 'ar'
  onClose: () => void
  onRetry?: () => void
  onUseTemplate?: () => void
  onManualInput?: () => void
  onModifyInput?: () => void
  onReportIssue?: () => void
}

export function ErrorRecoveryDialog({
  open,
  error,
  language = 'en',
  onClose,
  onRetry,
  onUseTemplate,
  onManualInput,
  onModifyInput,
  onReportIssue
}: ErrorRecoveryDialogProps) {
  const [isRetrying, setIsRetrying] = useState(false)
  
  if (!error) return null

  const recoveryOptions = getErrorRecoveryOptions(error, language)

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return '🌐'
      case 'rate_limit':
        return '⏱️'
      case 'timeout':
        return '⏰'
      case 'invalid_response':
        return '🔄'
      case 'validation':
        return '⚠️'
      default:
        return '❌'
    }
  }

  const getErrorColor = () => {
    switch (error.type) {
      case 'network':
        return 'text-blue-600 dark:text-blue-400'
      case 'rate_limit':
        return 'text-orange-600 dark:text-orange-400'
      case 'timeout':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'invalid_response':
        return 'text-purple-600 dark:text-purple-400'
      case 'validation':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const handleAction = async (action: string) => {
    switch (action) {
      case 'retry':
      case 'wait_retry':
        if (onRetry) {
          setIsRetrying(true)
          try {
            await new Promise(resolve => setTimeout(resolve, action === 'wait_retry' ? 2000 : 500))
            onRetry()
          } finally {
            setIsRetrying(false)
          }
        }
        break
      case 'template':
        if (onUseTemplate) {
          onUseTemplate()
          onClose()
        }
        break
      case 'manual':
      case 'offline':
        if (onManualInput) {
          onManualInput()
          onClose()
        }
        break
      case 'modify':
      case 'simplify':
      case 'review':
        if (onModifyInput) {
          onModifyInput()
          onClose()
        }
        break
      case 'report':
        if (onReportIssue) {
          onReportIssue()
        }
        break
      case 'check_connection':
        window.open('https://www.google.com', '_blank')
        break
      case 'later':
      case 'reset':
        onClose()
        break
      default:
        break
    }
  }

  const translations = {
    en: {
      title: 'AI Generation Failed',
      whatHappened: 'What Happened?',
      whatCanIDo: 'What Can I Do?',
      technicalDetails: 'Technical Details',
      close: 'Close',
      errorType: 'Error Type',
      retryable: error.retryable ? 'Retryable' : 'Not Retryable'
    },
    ar: {
      title: 'فشل توليد الذكاء الاصطناعي',
      whatHappened: 'ماذا حدث؟',
      whatCanIDo: 'ماذا يمكنني أن أفعل؟',
      technicalDetails: 'التفاصيل التقنية',
      close: 'إغلاق',
      errorType: 'نوع الخطأ',
      retryable: error.retryable ? 'قابل لإعادة المحاولة' : 'غير قابل لإعادة المحاولة'
    }
  }

  const t = translations[language]

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`text-4xl ${getErrorColor()}`}>
              {getErrorIcon()}
            </div>
            <div>
              <div className="text-xl">{t.title}</div>
              <Badge 
                variant={error.retryable ? 'default' : 'destructive'}
                className="mt-1 text-xs"
              >
                {error.type.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Warning weight="fill" className="w-5 h-5 text-orange-600" />
                {t.whatHappened}
              </h3>
              <p className="text-sm text-foreground mb-3">
                {error.message}
              </p>
              {error.suggestedAction && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>💡 Suggestion:</strong> {error.suggestedAction}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Wrench weight="fill" className="w-5 h-5 text-primary" />
              {t.whatCanIDo}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {recoveryOptions.map((option, idx) => {
                const isRetryAction = ['retry', 'wait_retry'].includes(option.action)
                const Icon = isRetryAction ? ArrowClockwise : 
                            option.action === 'template' ? FileText : 
                            ArrowRight

                return (
                  <button
                    key={idx}
                    onClick={() => handleAction(option.action)}
                    disabled={isRetrying}
                    className="p-4 rounded-lg border-2 border-border hover:border-primary/70 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start gap-3">
                      <Icon 
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isRetrying && isRetryAction ? 'animate-spin' : ''}`}
                        weight="bold"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {error.context && Object.keys(error.context).length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold mb-2 flex items-center gap-2 hover:text-primary">
                <FileText weight="fill" className="w-4 h-4" />
                {t.technicalDetails}
              </summary>
              <Card className="mt-2">
                <CardContent className="pt-4">
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.errorType}:</span>
                      <span className="font-semibold">{error.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={error.retryable ? 'secondary' : 'destructive'} className="text-xs">
                        {t.retryable}
                      </Badge>
                    </div>
                    {Object.entries(error.context).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground">{key}:</span>
                        <span className="font-semibold max-w-[200px] truncate">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </details>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRetrying}>
            {t.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
