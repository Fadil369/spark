import { Component, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home, Copy, ChevronDown, ChevronUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { PhaseKey } from '@/lib/types'
import { translations, Language } from '@/lib/i18n'

interface PhaseErrorBoundaryProps {
  children: ReactNode
  phaseName: string
  phaseKey: PhaseKey
  onRetry?: () => void
  onReturnToDashboard?: () => void
  language?: Language
}

interface PhaseErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  showDetails: boolean
}

export class PhaseErrorBoundary extends Component<PhaseErrorBoundaryProps, PhaseErrorBoundaryState> {
  constructor(props: PhaseErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<PhaseErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in ${this.props.phaseName} phase:`, error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    })
    this.props.onRetry?.()
  }

  handleCopyError = () => {
    const { error, errorInfo } = this.state
    const { phaseName, phaseKey, language = 'en' } = this.props
    const t = translations[language].errorBoundary

    const errorText = `Error Report - ${phaseName} Phase (${phaseKey})
=============
Timestamp: ${new Date().toISOString()}
${t.errorType}: ${error?.name || 'Unknown'}
${t.errorMessage}: ${error?.message || 'No message'}

${t.stackTrace}:
${error?.stack || 'No stack trace'}

Component Stack:
${errorInfo?.componentStack || 'No component stack'}

Environment:
- URL: ${window.location.href}
- User Agent: ${navigator.userAgent}
`

    navigator.clipboard
      .writeText(errorText)
      .then(() => {
        toast.success(t.copied)
      })
      .catch(() => {
        toast.error(t.copyFailed)
      })
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state
    const { children, phaseName, onReturnToDashboard, language = 'en' } = this.props
    const t = translations[language].errorBoundary
    const commonT = translations[language]
    const isRTL = language === 'ar'

    if (!hasError) {
      return children
    }

    return (
      <div className="w-full max-w-4xl mx-auto py-8 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <Alert variant="destructive" className="border-2">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">{t.phaseError}</AlertTitle>
          <AlertDescription className="text-base">
            <strong>{phaseName}</strong> {t.encounteredError}
          </AlertDescription>
        </Alert>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {phaseName} {t.phaseError}
            </CardTitle>
            <CardDescription>{t.tip}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-muted-foreground">{t.errorType}</h4>
              </div>
              <div className="text-sm font-mono bg-background p-2 rounded border">
                {error?.name || 'UnknownError'}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-muted-foreground">{t.errorMessage}</h4>
              </div>
              <div className="text-sm bg-background p-3 rounded border max-h-32 overflow-auto">
                {error?.message || 'No error message available'}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={this.toggleDetails}
              className="w-full justify-between"
            >
              {showDetails ? t.hideDetails : t.showDetails}
              {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {showDetails && (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">{t.stackTrace}</h4>
                  <pre className="text-xs font-mono bg-background p-3 rounded border overflow-auto max-h-64">
                    {error?.stack || 'No stack trace available'}
                  </pre>
                </div>

                {errorInfo?.componentStack && (
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                      Component Stack
                    </h4>
                    <pre className="text-xs font-mono bg-background p-3 rounded border overflow-auto max-h-64">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button onClick={this.handleCopyError} variant="outline" className="flex-1 gap-2">
              <Copy className="h-4 w-4" />
              {t.copyError}
            </Button>
            <Button onClick={this.handleRetry} variant="default" className="flex-1 gap-2">
              <RefreshCw className="h-4 w-4" />
              {commonT.retry}
            </Button>
            {onReturnToDashboard && (
              <Button
                onClick={onReturnToDashboard}
                variant="secondary"
                className="flex-1 gap-2"
              >
                <Home className="h-4 w-4" />
                {commonT.backToDashboard}
              </Button>
            )}
          </CardFooter>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          {t.persistsMessage}
        </div>
      </div>
    )
  }
}
