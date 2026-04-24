import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Cloud, 
  Rocket, 
  GitBranch, 
  Package, 
  CheckCircle,
  ArrowSquareOut,
  Terminal,
  FileCode,
  HardDrives,
  Shield
} from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  DEPLOYMENT_PLATFORMS, 
  DeploymentPlatform,
  generateGitHubActionsWorkflow,
  generateVercelConfig,
  generateNetlifyConfig,
  generateDockerfile,
  generateDockerCompose,
  getRecommendedPlatform
} from '@/lib/cicd'
import { FrameworkType, TemplateType } from '@/lib/frameworkBestPractices'
import { useState } from 'react'
import { toast } from 'sonner'

interface DeploymentInstructionsProps {
  framework: FrameworkType
  template: TemplateType
  projectName: string
  repoUrl?: string
}

export function DeploymentInstructions({ 
  framework, 
  template, 
  projectName,
  repoUrl 
}: DeploymentInstructionsProps) {
  const { t } = useLanguage()
  const recommendedPlatform = getRecommendedPlatform(template)
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  const platforms: DeploymentPlatform[] = ['vercel', 'netlify', 'github-pages', 'railway', 'render']
  
  const copyToClipboard = (content: string, fileName: string) => {
    navigator.clipboard.writeText(content)
    setCopiedFile(fileName)
    toast.success(`${fileName} copied to clipboard!`)
    setTimeout(() => setCopiedFile(null), 2000)
  }

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${fileName} downloaded!`)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{t.deployment.title}</h3>
            <p className="text-muted-foreground mb-4">
              {t.deployment.subtitle}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Cloud className="w-3 h-3" />
                Automated Deployment
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <GitBranch className="w-3 h-3" />
                Continuous Integration
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" />
                Security Headers
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue={recommendedPlatform} className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 h-auto gap-2">
          {platforms.map(platform => (
            <TabsTrigger 
              key={platform} 
              value={platform}
              className="flex-col h-auto py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="font-semibold capitalize">{platform.replace('-', ' ')}</span>
              {platform === recommendedPlatform && (
                <Badge variant="default" className="mt-1 text-[10px]">
                  {t.deployment.recommended}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {platforms.map(platform => {
          const guide = DEPLOYMENT_PLATFORMS[platform]
          const workflow = generateGitHubActionsWorkflow(framework, template, platform)
          
          return (
            <TabsContent key={platform} value={platform} className="space-y-6 mt-6">
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{guide.name}</h3>
                    <p className="text-muted-foreground">{guide.description}</p>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {guide.pricing}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">{t.deployment.bestFor}</h4>
                    <p className="text-sm">{guide.description}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-muted-foreground">Key Features</h4>
                    <ul className="text-sm space-y-1">
                      {guide.features.slice(0, 4).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    {t.deployment.stepByStep}
                  </h4>
                  <ol className="space-y-3">
                    {guide.setupSteps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {guide.healthcareConsiderations.length > 0 && (
                  <div className="bg-accent/10 border border-accent/20 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-accent-foreground">
                      <Shield className="w-4 h-4" />
                      {t.deployment.healthcareCompliance}
                    </h4>
                    <ul className="space-y-2">
                      {guide.healthcareConsiderations.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {platform === 'vercel' && (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => window.open('https://vercel.com/new', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Deploy to Vercel
                    </Button>
                  )}
                  {platform === 'netlify' && (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => window.open('https://app.netlify.com/start', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Deploy to Netlify
                    </Button>
                  )}
                  {platform === 'github-pages' && repoUrl && (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => window.open(`${repoUrl}/settings/pages`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Pages Settings
                    </Button>
                  )}
                  {platform === 'railway' && (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => window.open('https://railway.app/new', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Deploy to Railway
                    </Button>
                  )}
                  {platform === 'render' && (
                    <Button 
                      variant="default" 
                      className="w-full"
                      onClick={() => window.open('https://dashboard.render.com/select-repo', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Deploy to Render
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(guide.name === 'Vercel' ? 'https://vercel.com/docs' : 
                                              guide.name === 'Netlify' ? 'https://docs.netlify.com' :
                                              guide.name === 'GitHub Pages' ? 'https://docs.github.com/en/pages' :
                                              guide.name === 'Railway' ? 'https://docs.railway.app' :
                                              'https://render.com/docs', '_blank')}
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    View Documentation
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-muted/30">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  {t.deployment.cicdPipelines}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.deployment.cicdDesc}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Terminal className="w-4 h-4" />
                        {workflow.fileName}
                      </h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(workflow.content, workflow.fileName)}
                        >
                          {copiedFile === workflow.fileName ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(workflow.content, workflow.fileName.split('/').pop() || 'workflow.yml')}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                    <pre className="bg-background p-4 rounded-lg overflow-x-auto text-xs border">
                      <code>{workflow.content}</code>
                    </pre>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-sm mb-2">Setup Instructions</h4>
                    <ol className="space-y-2 text-sm">
                      {workflow.instructions.map((instruction, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="font-bold text-primary">{i + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Card>

              {platform === 'vercel' && (
                <Card className="p-6 bg-muted/30">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Platform Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">vercel.json</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const config = generateVercelConfig(framework)
                              copyToClipboard(config.content, config.fileName)
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const config = generateVercelConfig(framework)
                              downloadFile(config.content, config.fileName)
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                      <pre className="bg-background p-4 rounded-lg overflow-x-auto text-xs border">
                        <code>{generateVercelConfig(framework).content}</code>
                      </pre>
                    </div>
                  </div>
                </Card>
              )}

              {platform === 'netlify' && (
                <Card className="p-6 bg-muted/30">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Platform Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">netlify.toml</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const config = generateNetlifyConfig(framework)
                              copyToClipboard(config.content, config.fileName)
                            }}
                          >
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const config = generateNetlifyConfig(framework)
                              downloadFile(config.content, config.fileName)
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                      <pre className="bg-background p-4 rounded-lg overflow-x-auto text-xs border">
                        <code>{generateNetlifyConfig(framework).content}</code>
                      </pre>
                    </div>
                  </div>
                </Card>
              )}

              <Card className="p-6 bg-muted/30">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Docker Configuration
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Containerize your application for consistent deployments across any platform.
                </p>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">Dockerfile</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const dockerfile = generateDockerfile(framework)
                            copyToClipboard(dockerfile.content, dockerfile.fileName)
                          }}
                        >
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const dockerfile = generateDockerfile(framework)
                            downloadFile(dockerfile.content, dockerfile.fileName)
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                    <pre className="bg-background p-4 rounded-lg overflow-x-auto text-xs border max-h-96">
                      <code>{generateDockerfile(framework).content}</code>
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm">docker-compose.yml</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const compose = generateDockerCompose(framework, projectName)
                            copyToClipboard(compose.content, compose.fileName)
                          }}
                        >
                          Copy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const compose = generateDockerCompose(framework, projectName)
                            downloadFile(compose.content, compose.fileName)
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                    <pre className="bg-background p-4 rounded-lg overflow-x-auto text-xs border">
                      <code>{generateDockerCompose(framework, projectName).content}</code>
                    </pre>
                  </div>

                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-sm mb-2">Docker Commands</h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div>
                        <div className="text-muted-foreground mb-1"># Build image</div>
                        <code className="bg-background px-2 py-1 rounded">docker build -t {projectName} .</code>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1"># Run container</div>
                        <code className="bg-background px-2 py-1 rounded">docker run -p 8080:80 {projectName}</code>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1"># Or use docker-compose</div>
                        <code className="bg-background px-2 py-1 rounded">docker-compose up</code>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      <Card className="p-6 bg-destructive/5 border-destructive/20">
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-destructive" />
          {t.deployment.productionChecklist}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t.deployment.beforeGoLive}
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span><strong>Authentication:</strong> Implement proper user authentication and authorization</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span><strong>HIPAA Compliance:</strong> If handling PHI, ensure HIPAA compliance and BAA with hosting provider</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span><strong>Security Audit:</strong> Conduct thorough security testing and penetration testing</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span><strong>Environment Variables:</strong> Never commit secrets, use secure environment variable management</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span><strong>Monitoring:</strong> Set up application monitoring, error tracking, and uptime monitoring</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span><strong>Backup Strategy:</strong> Implement automated backups for databases and critical data</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <span><strong>Legal Review:</strong> Consult with healthcare legal experts for compliance requirements</span>
          </li>
        </ul>
      </Card>
    </div>
  )
}
