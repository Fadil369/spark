import { Journey } from '@/lib/types'
import { calculateLevel, getXPForNextLevel, formatXP } from '@/lib/game'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star } from '@phosphor-icons/react'

interface GameStatsProps {
  journey: Journey
}

export function GameStats({ journey }: GameStatsProps) {
  const { xp, level, badges } = journey.gameState
  const xpForNext = getXPForNextLevel(level)
  const xpProgress = (xp % 200) / 200 * 100
  const earnedBadges = badges.filter(b => b.earned)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
            <Trophy weight="fill" className="w-6 h-6 text-accent" />
          </div>
          <div>
            <div className="text-2xl font-bold font-heading">Level {level}</div>
            <div className="text-sm text-muted-foreground">Founder Level</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">XP Progress</span>
            <span className="text-sm text-muted-foreground">{formatXP(xp)} / {formatXP(xpForNext)}</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {formatXP(xpForNext - (xp % 200))} XP to next level
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
            <div className="text-sm text-muted-foreground">Badges Earned</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
