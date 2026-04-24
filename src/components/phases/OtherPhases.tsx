import { Journey } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'

interface CompletionPhaseProps {
  journey: Journey
}

export function StoryPhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Story Phase - Coming Soon</CardTitle>
          <CardDescription>Transform your concept into a compelling narrative</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">Your concept: {journey.concept?.problem}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function BrandPhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Brand Phase - Coming Soon</CardTitle>
          <CardDescription>Generate name, tagline, and visual identity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Create your brand identity</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function PRDPhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>PRD Phase - Coming Soon</CardTitle>
          <CardDescription>Build a functional product requirements document</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Document your product requirements</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function CodePhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Code Phase - Coming Soon</CardTitle>
          <CardDescription>Turn your PRD into a runnable MVP scaffold</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Generate your code</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function GitHubPhase({ journey }: CompletionPhaseProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl">🎉</div>
        <h1 className="text-4xl font-bold font-heading">Congratulations!</h1>
        <p className="text-lg text-muted-foreground">
          You've completed your healthcare startup journey
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Journey Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {journey.concept && (
            <div>
              <h3 className="font-semibold mb-2">Concept</h3>
              <p className="text-sm text-muted-foreground">{journey.concept.problem}</p>
            </div>
          )}
          <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
            <Sparkle weight="fill" className="text-primary" />
            <div>
              <div className="font-semibold">Level {journey.gameState.level} Founder</div>
              <div className="text-sm text-muted-foreground">
                {journey.gameState.xp} XP earned
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
