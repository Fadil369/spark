import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ChartLineUp, 
  CheckCircle, 
  XCircle, 
  ProhibitInset, 
  Clock, 
  CurrencyDollar,
  ArrowClockwise,
  Database
} from '@phosphor-icons/react'
import { getGlobalUsageStats, clearAllRateLimits, formatCost, UsageStats } from '@/lib/rateLimiter'
import { useLanguage } from '@/contexts/LanguageContext'

export function UsageMonitor() {
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [clearing, setClearing] = useState(false)
  const { t } = useLanguage()

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await getGlobalUsageStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleClearStats = async () => {
    if (!confirm('Are you sure you want to clear all rate limit and usage data? This cannot be undone.')) {
      return
    }

    setClearing(true)
    try {
      await clearAllRateLimits()
      await loadStats()
    } catch (error) {
      console.error('Failed to clear stats:', error)
    } finally {
      setClearing(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLineUp className="w-5 h-5" />
            Loading Usage Statistics...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLineUp className="w-5 h-5" />
            Usage Statistics
          </CardTitle>
          <CardDescription>Unable to load usage data</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const successRate = stats.totalCalls > 0 
    ? (stats.successfulCalls / stats.totalCalls) * 100 
    : 0

  const topEndpoints = Object.entries(stats.callsByEndpoint)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
            <ChartLineUp className="w-6 h-6" />
            API Usage Monitor
          </h2>
          <p className="text-sm text-muted-foreground">
            Track your AI API usage and rate limits
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadStats}
            disabled={loading}
          >
            <ArrowClockwise className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearStats}
            disabled={clearing}
          >
            Clear Stats
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Total Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls}</div>
            <div className="text-xs text-muted-foreground mt-1">
              All API requests made
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Successful
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.successfulCalls}
            </div>
            <Progress value={successRate} className="mt-2 h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {successRate.toFixed(1)}% success rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.failedCalls}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Errors and failures
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ProhibitInset className="w-4 h-4 text-orange-600" />
              Blocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.blockedCalls}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Rate limit exceeded
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Token Usage
            </CardTitle>
            <CardDescription>AI model token consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Prompt Tokens</span>
                <Badge variant="secondary">
                  {stats.tokenUsage.promptTokens.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(stats.tokenUsage.promptTokens / Math.max(stats.tokenUsage.totalTokens, 1)) * 100} 
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Completion Tokens</span>
                <Badge variant="secondary">
                  {stats.tokenUsage.completionTokens.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(stats.tokenUsage.completionTokens / Math.max(stats.tokenUsage.totalTokens, 1)) * 100} 
                className="h-2"
              />
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Tokens</span>
                <Badge>
                  {stats.tokenUsage.totalTokens.toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CurrencyDollar className="w-5 h-5" />
              Cost Estimate
            </CardTitle>
            <CardDescription>Estimated API usage cost</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <div className="text-4xl font-bold text-primary">
                {formatCost(stats.costEstimate)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                Total estimated cost
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Input tokens:</span>
                <span>{formatCost(stats.tokenUsage.promptTokens * 0.00014 / 1000)}</span>
              </div>
              <div className="flex justify-between">
                <span>Output tokens:</span>
                <span>{formatCost(stats.tokenUsage.completionTokens * 0.00028 / 1000)}</span>
              </div>
              <div className="flex justify-between font-medium text-foreground pt-2 border-t">
                <span>Total:</span>
                <span>{formatCost(stats.costEstimate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {topEndpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ChartLineUp className="w-5 h-5" />
              Top Endpoints
            </CardTitle>
            <CardDescription>Most frequently used API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEndpoints.map(([endpoint, count], index) => {
                const percentage = (count / stats.totalCalls) * 100
                const cleanEndpoint = endpoint.replace('rate-limit-', '').replace('usage-stats-', '')
                
                return (
                  <div key={endpoint}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        #{index + 1} {cleanEndpoint}
                      </span>
                      <Badge variant="outline">{count} calls</Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.lastCallAt > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Last API call: {new Date(stats.lastCallAt).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
