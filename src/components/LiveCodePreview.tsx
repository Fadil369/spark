import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Eye, Code, Desktop, DeviceMobile, DeviceTablet, Sparkle, ShieldCheck, Lightning, CheckCircle, WarningCircle, XCircle, Lightbulb } from '@phosphor-icons/react'
import { validateCodeWithDeepSeek, enhanceCodeWithDeepSeek, generateCodeSuggestions, type CodeValidationResult, type CodeEnhancement } from '@/lib/deepseekHelper'
import { toast } from 'sonner'
import { successToast } from '@/lib/toastWithLogo'

interface LiveCodePreviewProps {
  files: Array<{
    path: string
    content: string
  }>
  onCodeUpdate?: (files: Array<{ path: string; content: string }>) => void
  brandName?: string
}

export function LiveCodePreview({ files, onCodeUpdate, brandName }: LiveCodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'ai-analysis'>('preview')
  const [selectedFileIndex, setSelectedFileIndex] = useState(0)
  const [validation, setValidation] = useState<CodeValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [enhancement, setEnhancement] = useState<CodeEnhancement | null>(null)

  const htmlFile = files.find(f => f.path.includes('.html') || f.path === 'index.html')
  const cssFile = files.find(f => f.path.includes('.css') && !f.path.includes('main.css'))
  const jsFile = files.find(f => f.path.includes('.js') || f.path.includes('.tsx') || f.path.includes('.jsx'))

  const generatePreviewHTML = () => {
    if (!htmlFile) return ''

    let html = htmlFile.content
    
    if (cssFile) {
      const styleTag = `<style>${cssFile.content}</style>`
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${styleTag}\n</head>`)
      } else {
        html = `${styleTag}\n${html}`
      }
    }

    if (jsFile) {
      const scriptTag = `<script>${jsFile.content}</script>`
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}\n</body>`)
      } else {
        html = `${html}\n${scriptTag}`
      }
    }

    const sandboxedHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          }
        </style>
      </head>
      <body>
        ${html.includes('<body') ? html.split('<body')[1].split('</body>')[0].replace(/^[^>]*>/, '') : html}
        ${cssFile ? `<style>${cssFile.content}</style>` : ''}
        ${jsFile ? `<script>${jsFile.content}</script>` : ''}
      </body>
      </html>
    `

    return sandboxedHTML
  }

  const updatePreview = () => {
    if (!iframeRef.current) return

    setIsRefreshing(true)
    
    const previewHTML = generatePreviewHTML()
    const iframe = iframeRef.current
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

    if (iframeDoc) {
      iframeDoc.open()
      iframeDoc.write(previewHTML)
      iframeDoc.close()
    }

    setTimeout(() => setIsRefreshing(false), 300)
  }

  useEffect(() => {
    updatePreview()
  }, [files])

  const handleValidateCode = async () => {
    const fileToValidate = files[selectedFileIndex]
    if (!fileToValidate) return

    setIsValidating(true)
    try {
      const language = fileToValidate.path.endsWith('.html') ? 'html' :
                      fileToValidate.path.endsWith('.css') ? 'css' :
                      fileToValidate.path.endsWith('.js') ? 'javascript' : 'html'
      
      const context = brandName ? `Healthcare startup application for ${brandName}` : 'Healthcare application'
      
      const result = await validateCodeWithDeepSeek(fileToValidate.content, language, context)
      setValidation(result)
      
      if (result.isValid) {
        successToast('Code validation complete! ✨')
      } else {
        toast.warning(`Found ${result.errors.length} critical issues`)
      }
      
      setActiveTab('ai-analysis')
    } catch (error) {
      toast.error(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsValidating(false)
    }
  }

  const handleEnhanceCode = async () => {
    const fileToEnhance = files[selectedFileIndex]
    if (!fileToEnhance) return

    setIsEnhancing(true)
    try {
      const language = fileToEnhance.path.endsWith('.html') ? 'html' :
                      fileToEnhance.path.endsWith('.css') ? 'css' :
                      fileToEnhance.path.endsWith('.js') ? 'javascript' : 'html'
      
      const enhancementGoals = [
        'Healthcare data security and HIPAA compliance',
        'Accessibility (WCAG 2.1 AA)',
        'Modern design patterns',
        'Performance optimization',
        'Clean and maintainable code'
      ]
      
      const result = await enhanceCodeWithDeepSeek(fileToEnhance.content, language, enhancementGoals)
      setEnhancement(result)
      
      successToast('Code enhanced successfully! 🚀')
      
      if (onCodeUpdate && result.enhancedCode) {
        const updatedFiles = files.map((f, idx) => 
          idx === selectedFileIndex ? { ...f, content: result.enhancedCode } : f
        )
        onCodeUpdate(updatedFiles)
      }
      
      setActiveTab('ai-analysis')
    } catch (error) {
      toast.error(`Enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleGenerateSuggestions = async () => {
    const fileForSuggestions = files[selectedFileIndex]
    if (!fileForSuggestions) return

    setIsLoadingSuggestions(true)
    try {
      const language = fileForSuggestions.path.endsWith('.html') ? 'html' :
                      fileForSuggestions.path.endsWith('.css') ? 'css' :
                      fileForSuggestions.path.endsWith('.js') ? 'javascript' : 'html'
      
      const newSuggestions = await generateCodeSuggestions(fileForSuggestions.content, language)
      setSuggestions(newSuggestions)
      
      successToast('AI suggestions generated! 💡')
      setActiveTab('ai-analysis')
    } catch (error) {
      toast.error(`Suggestion generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityBadge = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    return 'Needs Work'
  }

  const getViewportDimensions = () => {
    switch (viewportSize) {
      case 'mobile':
        return { width: '375px', height: '667px' }
      case 'tablet':
        return { width: '768px', height: '1024px' }
      case 'desktop':
      default:
        return { width: '100%', height: '100%' }
    }
  }

  const dimensions = getViewportDimensions()

  if (!htmlFile) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No HTML file found to preview</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" weight="fill" />
              Live Code Preview
              <Badge variant="secondary" className="ml-2">
                <Sparkle className="w-3 h-3 mr-1" weight="fill" />
                AI-Powered
              </Badge>
            </CardTitle>
            <CardDescription>Real-time preview with AI validation & enhancement</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewportSize === 'mobile' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewportSize('mobile')}
              title="Mobile view (375px)"
            >
              <DeviceMobile className="w-4 h-4" />
            </Button>
            <Button
              variant={viewportSize === 'tablet' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewportSize('tablet')}
              title="Tablet view (768px)"
            >
              <DeviceTablet className="w-4 h-4" />
            </Button>
            <Button
              variant={viewportSize === 'desktop' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewportSize('desktop')}
              title="Desktop view (100%)"
            >
              <Desktop className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <div className="flex items-center justify-between px-6 pt-4 pb-2 border-b">
            <TabsList>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Source
              </TabsTrigger>
              <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
                <Sparkle className="w-4 h-4" weight="fill" />
                AI Analysis
              </TabsTrigger>
            </TabsList>
            
            {activeTab === 'preview' && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {viewportSize}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={updatePreview}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </div>
            )}
            
            {activeTab === 'code' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateSuggestions}
                  disabled={isLoadingSuggestions}
                >
                  <Lightbulb className="w-4 h-4 mr-1" />
                  {isLoadingSuggestions ? 'Generating...' : 'Get Suggestions'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleValidateCode}
                  disabled={isValidating}
                >
                  <ShieldCheck className="w-4 h-4 mr-1" />
                  {isValidating ? 'Validating...' : 'Validate'}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleEnhanceCode}
                  disabled={isEnhancing}
                >
                  <Lightning className="w-4 h-4 mr-1" weight="fill" />
                  {isEnhancing ? 'Enhancing...' : 'Enhance'}
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="preview" className="mt-0 p-6">
            <div 
              className="relative bg-muted/30 rounded-lg overflow-hidden border-2 border-border"
              style={{
                height: viewportSize === 'desktop' ? '600px' : 'auto',
                display: 'flex',
                justifyContent: 'center',
                alignItems: viewportSize === 'desktop' ? 'stretch' : 'flex-start',
                padding: viewportSize === 'desktop' ? '0' : '20px'
              }}
            >
              {isRefreshing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Refreshing preview...</span>
                  </div>
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                title="Code Preview"
                sandbox="allow-scripts allow-same-origin"
                className="bg-white border-0 rounded"
                style={{
                  width: dimensions.width,
                  height: dimensions.height,
                  minHeight: viewportSize === 'desktop' ? '600px' : dimensions.height,
                  boxShadow: viewportSize !== 'desktop' ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" weight="fill" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">AI-Powered Preview</p>
                  <p className="text-blue-700 dark:text-blue-300 mb-2">
                    This preview is sandboxed for security. Use the AI tools to validate, enhance, and optimize your code.
                  </p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li>✨ Validate code for healthcare compliance</li>
                    <li>⚡ Enhance with best practices automatically</li>
                    <li>💡 Get intelligent improvement suggestions</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>


          <TabsContent value="code" className="mt-0 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">Select File to Analyze:</Badge>
                {files.map((file, idx) => (
                  <Button
                    key={idx}
                    variant={selectedFileIndex === idx ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedFileIndex(idx)}
                  >
                    {file.path}
                  </Button>
                ))}
              </div>
              
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden">
                      <div className="bg-muted px-4 py-2 font-mono text-sm font-semibold flex items-center justify-between">
                        <span>{file.path}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {file.content.split('\n').length} lines
                          </Badge>
                          {idx === selectedFileIndex && (
                            <Badge className="text-xs bg-primary">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                      <pre className="p-4 text-xs font-mono bg-background overflow-x-auto">
                        <code>{file.content}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="ai-analysis" className="mt-0 p-6">
            <ScrollArea className="max-h-[700px]">
              <div className="space-y-6">
                {!validation && !enhancement && suggestions.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Sparkle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" weight="fill" />
                      <h3 className="font-semibold text-lg mb-2">AI Analysis Ready</h3>
                      <p className="text-muted-foreground mb-4">
                        Use the tools in the "Source" tab to validate, enhance, or get suggestions for your code.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        <Button onClick={handleValidateCode} disabled={isValidating}>
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Validate Code
                        </Button>
                        <Button onClick={handleGenerateSuggestions} disabled={isLoadingSuggestions}>
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Get Suggestions
                        </Button>
                        <Button onClick={handleEnhanceCode} disabled={isEnhancing}>
                          <Lightning className="w-4 h-4 mr-2" weight="fill" />
                          Enhance Code
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {validation && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" weight="fill" />
                        Code Validation Results
                      </CardTitle>
                      <CardDescription>
                        Analysis for {files[selectedFileIndex]?.path}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <span className="font-semibold">Overall Status:</span>
                        {validation.isValid ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-4 h-4 mr-1" weight="fill" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-4 h-4 mr-1" weight="fill" />
                            Issues Found
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Structure</div>
                          <div className="flex items-center gap-2">
                            <Progress value={validation.quality.structure} className="h-2" />
                            <span className={`text-sm font-bold ${getQualityColor(validation.quality.structure)}`}>
                              {validation.quality.structure}%
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getQualityBadge(validation.quality.structure)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Security</div>
                          <div className="flex items-center gap-2">
                            <Progress value={validation.quality.security} className="h-2" />
                            <span className={`text-sm font-bold ${getQualityColor(validation.quality.security)}`}>
                              {validation.quality.security}%
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getQualityBadge(validation.quality.security)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Performance</div>
                          <div className="flex items-center gap-2">
                            <Progress value={validation.quality.performance} className="h-2" />
                            <span className={`text-sm font-bold ${getQualityColor(validation.quality.performance)}`}>
                              {validation.quality.performance}%
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getQualityBadge(validation.quality.performance)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">Accessibility</div>
                          <div className="flex items-center gap-2">
                            <Progress value={validation.quality.accessibility} className="h-2" />
                            <span className={`text-sm font-bold ${getQualityColor(validation.quality.accessibility)}`}>
                              {validation.quality.accessibility}%
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getQualityBadge(validation.quality.accessibility)}
                          </Badge>
                        </div>
                      </div>

                      {validation.errors.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-red-600">
                            <XCircle className="w-4 h-4" weight="fill" />
                            Critical Issues ({validation.errors.length})
                          </h4>
                          <ul className="space-y-2">
                            {validation.errors.map((error, idx) => (
                              <li key={idx} className="text-sm p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.warnings.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-yellow-600">
                            <WarningCircle className="w-4 h-4" weight="fill" />
                            Warnings ({validation.warnings.length})
                          </h4>
                          <ul className="space-y-2">
                            {validation.warnings.map((warning, idx) => (
                              <li key={idx} className="text-sm p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                {warning}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {validation.suggestions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600">
                            <Lightbulb className="w-4 h-4" weight="fill" />
                            Improvement Suggestions ({validation.suggestions.length})
                          </h4>
                          <ul className="space-y-2">
                            {validation.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {enhancement && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightning className="w-5 h-5 text-primary" weight="fill" />
                        Code Enhancement Applied
                      </CardTitle>
                      <CardDescription>
                        AI-powered improvements for {files[selectedFileIndex]?.path}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {enhancement.improvements.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-4 h-4" weight="fill" />
                            Improvements Applied ({enhancement.improvements.length})
                          </h4>
                          <ul className="space-y-2">
                            {enhancement.improvements.map((improvement, idx) => (
                              <li key={idx} className="text-sm p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-600" weight="fill" />
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {enhancement.explanations.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" weight="fill" />
                            Detailed Explanations
                          </h4>
                          <ul className="space-y-2">
                            {enhancement.explanations.map((explanation, idx) => (
                              <li key={idx} className="text-sm p-3 bg-muted/50 rounded-lg">
                                {explanation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-3">
                          The enhanced code has been automatically applied to your files. Preview the changes in the Preview tab.
                        </p>
                        <Button onClick={updatePreview} size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Updated Preview
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {suggestions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-primary" weight="fill" />
                        AI Suggestions
                      </CardTitle>
                      <CardDescription>
                        Intelligent recommendations for {files[selectedFileIndex]?.path}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold text-sm">
                              {idx + 1}
                            </div>
                            <span className="text-sm pt-0.5">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
