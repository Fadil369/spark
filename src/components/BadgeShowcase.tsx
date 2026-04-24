import { Journey } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { 
  Lightbulb, 
  BookOpen, 
  Palette, 
  FileText, 
  Code, 
  GithubLogo,
  Medal,
  Trophy,
  Crown,
  Star,
  Sparkle,
  MagicWand,
  type Icon as PhosphorIcon
} from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BadgeShowcaseProps {
  journey: Journey
}

const BADGE_ICON_MAP: Record<string, PhosphorIcon> = {
  Lightbulb,
  BookOpen,
  Palette,
  FileText,
  Code,
  GithubLogo,
  Medal,
  Trophy,
  Crown,
  Star,
  Sparkle,
  MagicWand
}

export function BadgeShowcase({ journey }: BadgeShowcaseProps) {
  const { t } = useLanguage()
  const earnedBadges = journey.gameState.badges.filter(b => b.earned)
  const unearnedBadges = journey.gameState.badges.filter(b => !b.earned)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.achievementBadges}</CardTitle>
        <CardDescription>{t.achievementBadgesSubtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {earnedBadges.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">{t.earned}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {earnedBadges.map((badge) => {
                  const Icon = BADGE_ICON_MAP[badge.icon] || Star
                  return (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-primary/10 border border-primary/20"
                    >
                      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                        <Icon weight="fill" className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold">{badge.name}</div>
                        <div className="text-[10px] text-muted-foreground">{badge.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {unearnedBadges.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-muted-foreground">{t.locked}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {unearnedBadges.map((badge) => {
                  const Icon = BADGE_ICON_MAP[badge.icon] || Star
                  return (
                    <div
                      key={badge.id}
                      className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50 border border-border opacity-60"
                    >
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Icon weight="regular" className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-muted-foreground">{badge.name}</div>
                        <div className="text-[10px] text-muted-foreground">{badge.description}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

