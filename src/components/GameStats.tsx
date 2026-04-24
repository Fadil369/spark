import { Journey } from '@/lib/types'
import { formatXP } from '@/lib/game'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Flame } from '@phosphor-icons/react'
import { useLanguage } from '@/contexts/LanguageContext'

interface GameStatsProps {
  journey: Journey
}

export function GameStats({ journey }: GameStatsProps) {
  const { t } = useLanguage()
  const { xp, level, badges, streakDays } = journey.gameState
  const xpInCurrentLevel = xp - (level - 1) * 200
  const xpProgress = Math.min((xpInCurrentLevel / 200) * 100, 100)
  const earnedBadges = badges.filter(b => b.earned)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Trophy weight="fill" className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-heading">{t.level} {level}</div>
            <div className="text-sm text-muted-foreground">{t.founderLevel}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 md:col-span-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{t.xpProgress}</span>
            <span className="text-sm text-muted-foreground">{formatXP(xpInCurrentLevel)} / 200</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {formatXP(200 - xpInCurrentLevel)} {t.xpToNextLevel}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Star weight="fill" className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-2xl font-bold font-heading">{earnedBadges.length}</div>
            <div className="text-sm text-muted-foreground">{t.badgesEarned}</div>
          </div>
        </div>
      </Card>

      {streakDays > 0 && (
        <Card className="p-6 md:col-span-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Flame weight="fill" className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <div className="text-2xl font-bold font-heading text-orange-600">{streakDays}</div>
              <div className="text-sm text-muted-foreground">{t.streakDays}</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

