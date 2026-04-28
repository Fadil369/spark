import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Warning, ProhibitInset } from '@phosphor-icons/react'
import { RateLimiter, formatTimeRemaining } from '@/lib/rateLimiter'

interface RateLimitAlertProps {
  endpoint: string
  onLimitReached?: () => void
}

export function RateLimitAlert({ endpoint, onLimitReached }: RateLimitAlertProps) {
  const [quota, setQuota] = useState<{ remaining: number; resetsIn: number } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const limiter = new RateLimiter(endpoint)
    
    const checkQuota = async () => {
      try {
        const quotaData = await limiter.getRemainingQuota()
        setQuota(quotaData)
        
        if (quotaData.remaining === 0 && onLimitReached) {
          onLimitReached()
        }
      } catch (error) {
        console.error('Failed to check rate limit:', error)
      } finally {
        setLoading(false)
      }
    }

    checkQuota()
    const interval = setInterval(checkQuota, 5000)
    
    return () => clearInterval(interval)
  }, [endpoint, onLimitReached])

  if (loading || !quota) return null

  const usagePercentage = ((quota.remaining / 20) * 100)
  const isWarning = usagePercentage < 30 && quota.remaining > 0
  const isBlocked = quota.remaining === 0

  if (!isWarning && !isBlocked) return null

  return (
    <Alert variant={isBlocked ? 'destructive' : 'default'} className="mb-4">
      <div className="flex items-start gap-3">
        {isBlocked ? (
          <ProhibitInset className="w-5 h-5 text-destructive" />
        ) : (
          <Warning className="w-5 h-5 text-orange-600" />
        )}
        <div className="flex-1 space-y-2">
          <AlertDescription>
            {isBlocked ? (
              <span className="font-semibold">
                Rate limit reached. Please wait {formatTimeRemaining(quota.resetsIn)} before making more requests.
              </span>
            ) : (
              <span>
                You have <span className="font-semibold">{quota.remaining} requests</span> remaining. 
                {quota.resetsIn > 0 && ` Resets in ${formatTimeRemaining(quota.resetsIn)}.`}
              </span>
            )}
          </AlertDescription>
          {!isBlocked && (
            <Progress value={usagePercentage} className="h-2" />
          )}
        </div>
      </div>
    </Alert>
  )
}
