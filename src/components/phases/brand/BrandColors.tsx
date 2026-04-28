import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from '@phosphor-icons/react'

interface BrandColorsProps {
  selectedColors: {
    primary: string
    secondary: string
    accent: string
  }
  selectedIcon: string
  onColorsChange: (colors: { primary: string; secondary: string; accent: string }) => void
  onIconChange: (icon: string) => void
  onBack: () => void
  onContinue: () => void
}

const colorPalettes = [
  {
    name: 'Medical Teal',
    primary: 'oklch(0.65 0.12 200)',
    secondary: 'oklch(0.25 0.05 250)',
    accent: 'oklch(0.68 0.20 350)'
  },
  {
    name: 'Clinical Blue',
    primary: 'oklch(0.55 0.15 240)',
    secondary: 'oklch(0.35 0.08 260)',
    accent: 'oklch(0.75 0.18 180)'
  },
  {
    name: 'Health Green',
    primary: 'oklch(0.60 0.14 150)',
    secondary: 'oklch(0.30 0.05 180)',
    accent: 'oklch(0.70 0.16 60)'
  },
  {
    name: 'Care Purple',
    primary: 'oklch(0.58 0.16 290)',
    secondary: 'oklch(0.28 0.06 280)',
    accent: 'oklch(0.72 0.14 340)'
  },
  {
    name: 'Wellness Orange',
    primary: 'oklch(0.68 0.15 40)',
    secondary: 'oklch(0.32 0.06 30)',
    accent: 'oklch(0.75 0.12 200)'
  }
]

const iconOptions = ['Heart', 'Heartbeat', 'FirstAid', 'Pill', 'Stethoscope', 'Hospital', 'Syringe', 'Bandaids']

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

export function BrandColors({
  selectedColors,
  selectedIcon,
  onColorsChange,
  onIconChange,
  onBack,
  onContinue
}: BrandColorsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Color Palette</CardTitle>
        <CardDescription>Select colors that reflect your brand personality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {colorPalettes.map((palette, idx) => (
            <button
              key={idx}
              onClick={() => onColorsChange({
                primary: palette.primary,
                secondary: palette.secondary,
                accent: palette.accent
              })}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedColors.primary === palette.primary
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg mb-2">{palette.name}</div>
                  <div className="flex gap-2">
                    <div className="w-12 h-12 rounded border" style={{ backgroundColor: palette.primary }} />
                    <div className="w-12 h-12 rounded border" style={{ backgroundColor: palette.secondary }} />
                    <div className="w-12 h-12 rounded border" style={{ backgroundColor: palette.accent }} />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Primary</div>
                  <div>Secondary</div>
                  <div>Accent</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold">Choose Your Icon</label>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {iconOptions.map((icon) => (
              <button
                key={icon}
                onClick={() => onIconChange(icon)}
                className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center ${
                  selectedIcon === icon
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl">{getIconEmoji(icon)}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onContinue} className="flex-1">
          Continue to Tagline
          <ArrowRight className="ml-2" weight="bold" />
        </Button>
      </CardFooter>
    </Card>
  )
}
