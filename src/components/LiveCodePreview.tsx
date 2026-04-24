import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Code, Desktop, DeviceMobile, DeviceTablet } from '@phosphor-icons/react'

interface LiveCodePreviewProps {
  files: Array<{
    path: string
    content: string
  }>
}

export function LiveCodePreview({ files }: LiveCodePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" weight="fill" />
              Live Preview
            </CardTitle>
            <CardDescription>See your generated code in action</CardDescription>
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
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'preview' | 'code')}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="w-4 h-4" />
                Source
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
          </div>

          <TabsContent value="preview" className="mt-0">
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

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div className="text-xs text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Preview Limitations</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    This is a sandboxed preview. External resources, APIs, and some JavaScript features may not work. 
                    For full functionality, deploy the code to a proper web server.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="mt-0">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {files.map((file, idx) => (
                <div key={idx} className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 font-mono text-sm font-semibold flex items-center justify-between">
                    <span>{file.path}</span>
                    <Badge variant="secondary" className="text-xs">
                      {file.content.split('\n').length} lines
                    </Badge>
                  </div>
                  <pre className="p-4 text-xs font-mono bg-background overflow-x-auto">
                    <code>{file.content}</code>
                  </pre>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
