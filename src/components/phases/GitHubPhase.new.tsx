import { useState, useEffect } from 'react'
import { Journey } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkle, Rocket, Code, Check, GitBranch, Package, CheckCircle } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { completePhase } from '@/lib/game'
import { useLanguage } from '@/contexts/LanguageContext'
import { DeploymentInstructions } from '@/components/DeploymentInstructions'

interface GitHubPhaseProps {
  journey: Journey
  onComplete?: (updatedJourney: Journey) => void
}

export function GitHubPhase({ journey, onComplete }: GitHubPhaseProps) {
  const [step, setStep] = useState<'summary' | 'configure' | 'deployment-options' | 'creating' | 'success'>('summary')
  const [deploymentChoice, setDeploymentChoice] = useState<'personal' | null>(null)
  const [repoName, setRepoName] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [includeDocker, setIncludeDocker] = useState(true)
  const [includeCICD, setIncludeCICD] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    if (journey.githubRepo) {
      setStep('success')
    } else if (journey.brand?.name) {
      const generatedName = journey.brand.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setRepoName(generatedName)
    }
  }, [])

  const handleCreateRepo = async () => {
    if (!journey.code || !repoName.trim()) {
      toast.error('Repository name is required')
      return
    }

    setIsCreating(true)
    setError(null)
    setStep('creating')

    try {
      const { createGitHubRepository, generateRepoDescription, generateReadmeContent } = await import('@/lib/github')
      const { getAllCICDFiles } = await import('@/lib/cicd')
      
      const description = generateRepoDescription(journey)
      
      const updatedJourneyForReadme = {
        ...journey,
        githubRepo: {
          name: repoName,
          url: '',
          createdAt: Date.now(),
          deploymentPlatforms: selectedPlatforms,
          includeDocker,
          includeCICD
        }
      }
      const readmeContent = generateReadmeContent(updatedJourneyForReadme)
      
      const filesToCommit = [...journey.code.files]
      
      filesToCommit.push({
        path: 'README.md',
        content: readmeContent
      })
      
      if (includeDocker || includeCICD) {
        const deploymentFiles = getAllCICDFiles(
          'html',
          journey.code.template,
          journey.brand?.name || 'project',
          selectedPlatforms as any[]
        )
        filesToCommit.push(...deploymentFiles)
      }

      const repo = await createGitHubRepository({
        name: repoName,
        description,
        isPrivate,
        files: filesToCommit
      })

      const repoWithConfig = {
        ...repo,
        deploymentPlatforms: selectedPlatforms,
        includeDocker,
        includeCICD
      }

      const updatedJourney = { ...journey, githubRepo: repoWithConfig }
      const completedJourney = completePhase(updatedJourney, 'github')
      
      if (onComplete) {
        onComplete(completedJourney)
      }

      setStep('success')
      toast.success('🎉 Repository created successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to create repository')
      toast.error(err.message || 'Failed to create repository')
      setStep('deployment-options')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold font-heading">{t.github.title}</h1>
        <p className="text-lg text-muted-foreground">
          {step === 'summary' ? t.github.subtitle : 
           step === 'configure' ? t.github.subtitleConfigure :
           step === 'deployment-options' ? 'Select deployment platforms and configurations' :
           step === 'creating' ? t.github.subtitleCreating :
           t.github.subtitleSuccess}
        </p>
      </div>

      {step === 'summary' && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket weight="fill" className="text-primary" />
                {t.github.journeySummary}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {journey.concept && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{t.github.concept}</h3>
                  <p className="text-sm">{journey.concept.problem}</p>
                </div>
              )}
              
              {journey.brand && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{t.github.brand}</h3>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{journey.brand.logo}</div>
                    <div>
                      <div className="font-semibold">{journey.brand.name}</div>
                      <div className="text-sm text-muted-foreground">{journey.brand.tagline}</div>
                    </div>
                  </div>
                </div>
              )}

              {journey.code && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">{t.github.generatedCode}</h3>
                  <div className="flex flex-wrap gap-2">
                    {journey.code.files.map((file, idx) => (
                      <Badge key={idx} variant="secondary">
                        {file.path}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <Sparkle weight="fill" className="text-primary" />
                <div>
                  <div className="font-semibold">{t.level} {journey.gameState.level} {t.founderLevel}</div>
                  <div className="text-sm text-muted-foreground">
                    {journey.gameState.xp} XP {t.github.journeyCompleteStats} • {journey.gameState.badges.filter(b => b.earned).length} {t.github.badges}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.github.deployYourCode}</CardTitle>
              <CardDescription>
                {t.github.readyToDeployDesc}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" weight="fill" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold">{t.github.downloadCodeFiles}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.github.downloadCodeDesc}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {journey.code?.files.map((file, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const blob = new Blob([file.content], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = file.path
                            a.click()
                            URL.revokeObjectURL(url)
                            toast.success(`Downloaded ${file.path}`)
                          }}
                        >
                          {file.path}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" weight="fill" />
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">{t.github.manualGitHubSetup}</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {t.github.manualSetupDesc}
                    </p>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal ml-4">
                      <li>{t.github.manualStep1}</li>
                      <li>{t.github.manualStep2}</li>
                      <li>{t.github.manualStep3}</li>
                      <li>{t.github.manualStep4}</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => {
                  if (onComplete) {
                    const updatedJourney = completePhase(journey, 'github')
                    onComplete(updatedJourney)
                  }
                  setStep('success')
                }}
                className="w-full"
                size="lg"
              >
                <Check className="mr-2" weight="bold" />
                {t.github.completeJourney}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 'configure' && (
        <Card>
          <CardHeader>
            <CardTitle>{t.github.configureRepository}</CardTitle>
            <CardDescription>{t.github.configureRepoDesc}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-sm">
                <p className="font-semibold text-destructive mb-1">{t.error}</p>
                <p className="text-muted-foreground">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="repo-name" className="text-sm font-semibold">
                {t.github.repositoryName}
              </label>
              <input
                id="repo-name"
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder={t.github.repoNamePlaceholder}
                className="w-full px-4 py-2 rounded-lg border border-input bg-background"
              />
              <p className="text-xs text-muted-foreground">
                {t.github.repoNameDesc}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm">{t.github.repositoryVisibility}</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isPrivate}
                    onChange={() => setIsPrivate(false)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium">{t.github.public}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.publicDesc}
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                  <input
                    type="radio"
                    checked={isPrivate}
                    onChange={() => setIsPrivate(true)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-medium">{t.github.private}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.privateDesc}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold mb-1 text-blue-900 dark:text-blue-100">{t.github.authenticationRequired}</p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    {t.github.authRequiredDesc}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('summary')}>
              {t.back}
            </Button>
            <Button 
              onClick={() => setStep('deployment-options')} 
              disabled={!repoName.trim()}
              className="flex-1"
              size="lg"
            >
              <ArrowRight className="mr-2" weight="bold" />
              {t.github.continueToDeployment || 'Continue to Deployment'}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'deployment-options' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket weight="fill" className="text-primary" />
              {t.github.deploymentConfiguration || 'Deployment Configuration'}
            </CardTitle>
            <CardDescription>
              {t.github.deploymentConfigurationDesc || 'Choose deployment platforms and configure CI/CD pipeline for your application'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">{t.github.selectPlatforms || 'Select Deployment Platforms'}</h3>
                <Badge variant="secondary" className="text-xs">
                  {selectedPlatforms.length} selected
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t.github.selectPlatformsDesc || 'Choose one or more platforms where you want to deploy your application. CI/CD workflows and config files will be automatically generated.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('vercel')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'vercel'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'vercel'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      Vercel
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Recommended for React/Vue</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Zero-config deployments with automatic HTTPS and global CDN
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('netlify')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'netlify'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'netlify'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      Netlify
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">Great for static sites</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      All-in-one platform with form handling and serverless functions
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('github-pages')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'github-pages'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'github-pages'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      GitHub Pages
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-100 dark:bg-green-900">Free</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Free static site hosting directly from your repository
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('railway')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'railway'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'railway'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Railway</div>
                    <p className="text-xs text-muted-foreground">
                      Modern platform with database support and easy scaling
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.includes('render')}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms([...selectedPlatforms, 'render'])
                      } else {
                        setSelectedPlatforms(selectedPlatforms.filter(p => p !== 'render'))
                      }
                    }}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="flex-1">
                    <div className="font-semibold mb-1">Render</div>
                    <p className="text-xs text-muted-foreground">
                      Unified cloud for static sites, web services, and databases
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-base">{t.github.additionalOptions || 'Additional Configuration'}</h3>
              
              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-primary/20 bg-primary/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCICD}
                  onChange={(e) => setIncludeCICD(e.target.checked)}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    <GitBranch weight="bold" className="w-4 h-4 text-primary" />
                    {t.github.includeCI || 'Include CI/CD Pipeline'}
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Recommended</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t.github.includeCIDesc || 'Automatically generate GitHub Actions workflows for continuous deployment to selected platforms'}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Automatic deployments on push to main branch</p>
                    <p>✓ Preview deployments for pull requests</p>
                    <p>✓ Build and test automation</p>
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border hover:border-primary/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDocker}
                  onChange={(e) => setIncludeDocker(e.target.checked)}
                  className="mt-1 w-5 h-5"
                />
                <div className="flex-1">
                  <div className="font-semibold mb-1 flex items-center gap-2">
                    <Package weight="bold" className="w-4 h-4" />
                    {t.github.includeDocker || 'Include Docker Configuration'}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {t.github.includeDockerDesc || 'Generate Dockerfile and docker-compose.yml for containerized deployments'}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>✓ Dockerfile with multi-stage builds</p>
                    <p>✓ Docker Compose for local development</p>
                    <p>✓ Production-ready container configuration</p>
                  </div>
                </div>
              </label>
            </div>

            {selectedPlatforms.length > 0 && (includeCICD || includeDocker) && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" weight="fill" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                      {t.github.filesWillBeGenerated || 'Files that will be generated:'}
                    </p>
                    <ul className="text-blue-700 dark:text-blue-300 text-xs space-y-1 ml-4 list-disc">
                      <li>README.md with deployment instructions</li>
                      <li>DEPLOYMENT.md with detailed platform guides</li>
                      {includeCICD && selectedPlatforms.map(platform => (
                        <li key={platform}>.github/workflows/deploy-{platform}.yml</li>
                      ))}
                      {includeCICD && selectedPlatforms.includes('vercel') && <li>vercel.json configuration</li>}
                      {includeCICD && selectedPlatforms.includes('netlify') && <li>netlify.toml configuration</li>}
                      {includeDocker && <li>Dockerfile for production builds</li>}
                      {includeDocker && <li>docker-compose.yml for local development</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="outline" onClick={() => setStep('configure')}>
              {t.back}
            </Button>
            <Button 
              onClick={handleCreateRepo} 
              disabled={!repoName.trim() || isCreating}
              className="flex-1"
              size="lg"
            >
              {isCreating ? (
                <>{t.github.creatingRepository}</>
              ) : (
                <>
                  <Rocket className="mr-2" weight="fill" />
                  {t.github.createRepository}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 'creating' && (
        <Card>
          <CardContent className="py-16 text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/30 rounded-full" />
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <Rocket className="w-12 h-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" weight="fill" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{t.github.creatingRepoProgress}</h3>
              <p className="text-muted-foreground">{t.github.creatingRepoWait}</p>
            </div>
            <div className="max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <p>✓ {t.github.creatingRepoStep1}</p>
              <p>✓ {t.github.creatingRepoStep2}</p>
              <p>✓ {t.github.creatingRepoStep3}</p>
              <p className="animate-pulse">⏳ {t.github.creatingRepoStep4}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'success' && journey.githubRepo && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
            <CardContent className="pt-6 pb-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎉</div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{t.github.repoCreatedSuccess}</h3>
                  <p className="text-muted-foreground">{t.github.startupLiveOnGitHub}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.github.yourGitHubRepo}</CardTitle>
              <CardDescription>{t.github.accessCodeAnytime}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-lg border-2 border-primary/20 bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-primary" weight="fill" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg mb-1">{journey.githubRepo.name}</div>
                    <a 
                      href={journey.githubRepo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {journey.githubRepo.url}
                    </a>
                    {journey.githubRepo.commitSha && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Initial commit: {journey.githubRepo.commitSha.slice(0, 7)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DeploymentInstructions 
                repoUrl={journey.githubRepo.url}
                projectName={journey.githubRepo.name}
                framework="html"
                template={journey.code?.template || 'landing'}
              />

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">{t.github.nextStepsGitHub}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a
                    href={journey.githubRepo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="font-medium mb-1">{t.github.viewOnGitHub}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.viewOnGitHubDesc}
                    </div>
                  </a>

                  <a
                    href={`${journey.githubRepo.url}/archive/refs/heads/main.zip`}
                    className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="font-medium mb-1">{t.github.downloadCode}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.downloadCodeDesc}
                    </div>
                  </a>

                  <a
                    href={`${journey.githubRepo.url}/settings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="font-medium mb-1">{t.github.repoSettings}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.github.repoSettingsDesc}
                    </div>
                  </a>

                  <div className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-all cursor-pointer">
                    <div className="font-medium mb-1">{t.github.cloneLocally}</div>
                    <div className="text-xs text-muted-foreground">
                      git clone {journey.githubRepo.url}.git
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1 text-sm">
                    <p className="font-semibold mb-1 text-orange-900 dark:text-orange-100">{t.github.remember}</p>
                    <p className="text-orange-700 dark:text-orange-300 text-xs">
                      {t.github.rememberDesc}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
                <Sparkle weight="fill" className="text-primary" />
                <div>
                  <div className="font-semibold">🏆 {t.github.journeyComplete}</div>
                  <div className="text-sm text-muted-foreground">
                    {t.level} {journey.gameState.level} {t.founderLevel} • {journey.gameState.xp} XP {t.github.journeyCompleteStats} • {journey.gameState.badges.filter(b => b.earned).length} {t.github.badges}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
