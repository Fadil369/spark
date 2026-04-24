import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Trophy, Star, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { SparkLogo } from '@/components/SparkLogo'

interface CelebrationDialogProps {
  open: boolean
  onClose: () => void
  phaseName: string
  xpEarned: number
  badgeName?: string
  isRTL?: boolean
  onContinue?: () => void
  language?: 'en' | 'ar'
}

const CONFETTI_COLORS = [
  'bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400',
  'bg-purple-400', 'bg-orange-400', 'bg-teal-400', 'bg-red-400'
]

function ConfettiPiece({ delay }: { delay: number }) {
  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
  const left = Math.random() * 100
  const size = Math.random() * 8 + 4

  return (
    <div
      className={cn('absolute rounded-sm opacity-0', color)}
      style={{
        left: `${left}%`,
        top: '-10px',
        width: size,
        height: size,
        animation: `confetti-fall ${1.5 + Math.random()}s ease-in ${delay}ms forwards`,
        transform: `rotate(${Math.random() * 360}deg)`,
      }}
    />
  )
}

export function CelebrationDialog({
  open,
  onClose,
  phaseName,
  xpEarned,
  badgeName,
  isRTL = false,
  onContinue,
  language = 'en',
}: CelebrationDialogProps) {
  const [showContent, setShowContent] = useState(false)
  const confettiPieces = Array.from({ length: 30 }, (_, i) => i)

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => setShowContent(true), 100)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [open])

  const labels = language === 'ar'
    ? {
        congratulations: 'تهانينا! 🎉',
        phaseComplete: 'مرحلة مكتملة!',
        xpEarned: 'نقاط خبرة مكتسبة',
        badgeUnlocked: 'شارة مفتوحة',
        continueToNext: 'المتابعة للمرحلة التالية',
        viewDashboard: 'عرض لوحة التحكم',
      }
    : {
        congratulations: 'Congratulations! 🎉',
        phaseComplete: 'Phase Complete!',
        xpEarned: 'XP Earned',
        badgeUnlocked: 'Badge Unlocked',
        continueToNext: 'Continue to Next Phase',
        viewDashboard: 'View Dashboard',
      }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        className="sm:max-w-md text-center overflow-hidden p-0"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Confetti overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {open && confettiPieces.map((i) => (
            <ConfettiPiece key={i} delay={i * 60} />
          ))}
        </div>

        <div
          className={cn(
            'relative p-8 space-y-6 transition-all duration-500',
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          )}
        >
          {/* Animated Spark Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary-foreground/20 flex items-center justify-center shadow-lg shadow-primary/20">
                <SparkLogo className="w-16 h-16 text-primary-foreground" animated />
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center animate-pulse">
                <Star weight="fill" className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-heading">{labels.congratulations}</h2>
            <p className="text-muted-foreground">
              <span className="font-semibold text-primary">{phaseName}</span>
              {' '}{labels.phaseComplete}
            </p>
          </div>

          {/* XP and Badge */}
          <div className="flex gap-3 justify-center">
            <div className="flex flex-col items-center gap-1 bg-primary/10 rounded-xl px-6 py-3">
              <span className="text-3xl font-bold text-primary">+{xpEarned}</span>
              <span className="text-xs text-muted-foreground">{labels.xpEarned}</span>
            </div>
            {badgeName && (
              <div className="flex flex-col items-center gap-1 bg-yellow-500/10 rounded-xl px-6 py-3">
                <Trophy weight="fill" className="w-8 h-8 text-yellow-500" />
                <span className="text-xs text-muted-foreground">{labels.badgeUnlocked}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {onContinue && (
              <Button onClick={onContinue} className="w-full">
                {labels.continueToNext}
                <ArrowRight className={cn('w-4 h-4', isRTL ? 'mr-2 rotate-180' : 'ml-2')} weight="bold" />
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="w-full">
              {labels.viewDashboard}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
