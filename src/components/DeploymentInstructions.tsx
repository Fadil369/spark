import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Cloud, Code, Rocket, Globe, FileHtml, Terminal, CheckCircle, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useLanguage } from '@/contexts/LanguageContext'
import { useState } from 'react'

interface DeploymentInstructionsProps {
  repoUrl: string
  repoName: string
  framework: 'html' | 'react' | 'vue'
}

export function DeploymentInstructions({ repoUrl, repoName, framework }: DeploymentInstructionsProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('vercel')

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const deploymentOptions = [
    {
      id: 'vercel',
      name: 'Vercel',
      icon: <Rocket weight="fill" />,
      color: 'text-black dark:text-white',
      recommended: true,
      difficulty: t.deployment.easy,
      time: '2-5 min',
      free: true,
      description: t.deployment.vercelDesc,
      bestFor: t.deployment.vercelBestFor,
      steps: [
        {
          title: t.deployment.vercelStep1Title,
          code: null,
          description: t.deployment.vercelStep1Desc,
          action: { label: t.deployment.goToVercel, url: 'https://vercel.com/new' }
        },
        {
          title: t.deployment.vercelStep2Title,
          code: null,
          description: t.deployment.vercelStep2Desc,
          action: null
        },
        {
          title: t.deployment.vercelStep3Title,
          code: null,
          description: t.deployment.vercelStep3Desc,
          action: null
        },
        {
          title: t.deployment.vercelStep4Title,
          code: null,
          description: t.deployment.vercelStep4Desc,
          action: null
        }
      ]
    },
    {
      id: 'netlify',
      name: 'Netlify',
      icon: <Cloud weight="fill" />,
      color: 'text-teal-600',
      recommended: false,
      difficulty: t.deployment.easy,
      time: '3-5 min',
      free: true,
      description: t.deployment.netlifyDesc,
      bestFor: t.deployment.netlifyBestFor,
      steps: [
        {
          title: t.deployment.netlifyStep1Title,
          code: null,
          description: t.deployment.netlifyStep1Desc,
          action: { label: t.deployment.goToNetlify, url: 'https://app.netlify.com/start' }
        },
        {
          title: t.deployment.netlifyStep2Title,
          code: null,
          description: t.deployment.netlifyStep2Desc,
          action: null
        },
        {
          title: t.deployment.netlifyStep3Title,
          code: framework === 'html' 
            ? null 
            : framework === 'react'
            ? 'npm run build\n# Build directory: dist'
            : 'npm run build\n# Build directory: dist',
          description: t.deployment.netlifyStep3Desc,
          action: null
        },
        {
          title: t.deployment.netlifyStep4Title,
          code: null,
          description: t.deployment.netlifyStep4Desc,
          action: null
        }
      ]
    },
    {
      id: 'github-pages',
      name: 'GitHub Pages',
      icon: <FileHtml weight="fill" />,
      color: 'text-purple-600',
      recommended: framework === 'html',
      difficulty: t.deployment.easy,
      time: '5-10 min',
      free: true,
      description: t.deployment.githubPagesDesc,
      bestFor: t.deployment.githubPagesBestFor,
      steps: [
        {
          title: t.deployment.githubPagesStep1Title,
          code: null,
          description: t.deployment.githubPagesStep1Desc,
          action: { label: t.deployment.openRepoSettings, url: `${repoUrl}/settings/pages` }
        },
        {
          title: t.deployment.githubPagesStep2Title,
          code: null,
          description: t.deployment.githubPagesStep2Desc,
          action: null
        },
        {
          title: t.deployment.githubPagesStep3Title,
          code: null,
          description: t.deployment.githubPagesStep3Desc,
          action: null
        },
        {
          title: t.deployment.githubPagesStep4Title,
          code: null,
          description: t.deployment.githubPagesStep4Desc,
          action: null
        }
      ]
    },
    {
      id: 'local',
      name: t.deployment.localDev,
      icon: <Terminal weight="fill" />,
      color: 'text-orange-600',
      recommended: false,
      difficulty: t.deployment.moderate,
      time: '10-15 min',
      free: true,
      description: t.deployment.localDevDesc,
      bestFor: t.deployment.localDevBestFor,
      steps: [
        {
          title: t.deployment.localStep1Title,
          code: `git clone ${repoUrl}.git\ncd ${repoName}`,
          description: t.deployment.localStep1Desc,
          action: null
        },
        {
          title: t.deployment.localStep2Title,
          code: framework === 'html' 
            ? null 
            : 'npm install',
          description: framework === 'html' 
            ? t.deployment.localStep2DescHtml
            : t.deployment.localStep2Desc,
          action: null
        },
        {
          title: t.deployment.localStep3Title,
          code: framework === 'html' 
            ? '# Open index.html in your browser\n# Or use a local server:\nnpx serve .'
            : framework === 'react'
            ? 'npm run dev'
            : 'npm run dev',
          description: framework === 'html' 
            ? t.deployment.localStep3DescHtml
            : t.deployment.localStep3Desc,
          action: null
        },
        {
          title: t.deployment.localStep4Title,
          code: framework === 'html' 
            ? 'http://localhost:8080'
            : 'http://localhost:5173',
          description: t.deployment.localStep4Desc,
          action: null
        }
      ]
    }
  ]

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe weight="fill" className="w-5 h-5 text-primary" />
              {t.deployment.title}
            </CardTitle>
            <CardDescription>{t.deployment.subtitle}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent">
            {deploymentOptions.map((option) => (
              <TabsTrigger
                key={option.id}
                value={option.id}
                className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className={`text-xl ${option.color}`}>{option.icon}</span>
                <span className="text-sm font-semibold">{option.name}</span>
                {option.recommended && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    {t.deployment.recommended}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {deploymentOptions.map((option) => (
            <TabsContent key={option.id} value={option.id} className="mt-6 space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">{t.deployment.difficulty}</div>
                  <div className="font-semibold text-sm">{option.difficulty}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">{t.deployment.time}</div>
                  <div className="font-semibold text-sm">{option.time}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">{t.deployment.cost}</div>
                  <div className="font-semibold text-sm">{option.free ? t.deployment.free : t.deployment.paid}</div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm mb-2">{option.description}</p>
                <p className="text-xs text-muted-foreground">
                  <strong>{t.deployment.bestFor}:</strong> {option.bestFor}
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm">{t.deployment.stepByStep}</h3>
                {option.steps.map((step, idx) => (
                  <div key={idx} className="relative pl-8 pb-4 border-l-2 border-border last:border-l-0 last:pb-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary-foreground">{idx + 1}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                      
                      {step.code && (
                        <div className="relative">
                          <ScrollArea className="max-h-32">
                            <pre className="p-3 rounded-lg bg-muted text-xs font-mono overflow-x-auto">
                              <code>{step.code}</code>
                            </pre>
                          </ScrollArea>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                            onClick={() => copyToClipboard(step.code!, `${t.deployment.step} ${idx + 1}`)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                      
                      {step.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open(step.action!.url, '_blank')}
                        >
                          {step.action.label}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" weight="fill" />
                <div className="text-sm">
                  <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                    {t.deployment.successTip}
                  </p>
                  <p className="text-green-700 dark:text-green-300 text-xs">
                    {option.id === 'vercel' && t.deployment.vercelSuccessTip}
                    {option.id === 'netlify' && t.deployment.netlifySuccessTip}
                    {option.id === 'github-pages' && t.deployment.githubPagesSuccessTip}
                    {option.id === 'local' && t.deployment.localSuccessTip}
                  </p>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
