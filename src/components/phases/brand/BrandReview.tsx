import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from '@phosphor-icons/react'

interface BrandReviewProps {
  selectedName: string
  selectedTagline: string
  selectedColors: {
    primary: string
    secondary: string
    accent: string
  }
  selectedIcon: string
  onStartOver: () => void
  onComplete: () => void
}

const getIconEmoji = (icon: string): string => {
  const iconMap: Record<string, string> = {
    'Heart': '❤️',
    'Heartbeat': '💓',
    'FirstAid': '🩹',
    'Pill': '💊',
    'Stethoscope': '🩺',
    'Hospital': '🏥',
    'Syringe': '💉',
    'Bandaids': '🩹'
  }
  return iconMap[icon] || '🩹'
}

export function BrandReview({
  selectedName,
  selectedTagline,
  selectedColors,
  selectedIcon,
  onStartOver,
  onComplete
}: BrandReviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Brand Identity</CardTitle>
        <CardDescription>Review your complete brand kit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="text-center p-8 rounded-lg" style={{ backgroundColor: selectedColors.primary }}>
          <div className="text-6xl mb-4">
            {getIconEmoji(selectedIcon)}
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">{selectedName}</h2>
          <p className="text-xl text-white/90">{selectedTagline}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="w-16 h-16 rounded-full mx-auto mb-2" style={{ backgroundColor: selectedColors.primary }} />
            <div className="text-xs text-muted-foreground">Primary</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="w-16 h-16 rounded-full mx-auto mb-2" style={{ backgroundColor: selectedColors.secondary }} />
            <div className="text-xs text-muted-foreground">Secondary</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="w-16 h-16 rounded-full mx-auto mb-2" style={{ backgroundColor: selectedColors.accent }} />
            <div className="text-xs text-muted-foreground">Accent</div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button variant="outline" onClick={onStartOver}>
          Start Over
        </Button>
        <Button onClick={onComplete} className="flex-1">
          Complete Brand Phase
          <ArrowRight className="ml-2" weight="bold" />
        </Button>
      </CardFooter>
    </Card>
  )
}
