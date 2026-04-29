// Lightweight in-memory + localStorage rate limiter (no GitHub Spark dependency)
export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  retryAfterMs?: number
}

export interface RateLimitState {
  count: number
  resetAt: number
  blocked: boolean
}

export interface UsageStats {
  totalCalls: number
  successfulCalls: number
  failedCalls: number
  blockedCalls: number
  lastCallAt: number
  callsByEndpoint: Record<string, number>
  tokenUsage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  costEstimate: number
}

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  'concepts': { maxRequests: 100, windowMs: 60000 },
  'refine': { maxRequests: 5, windowMs: 60000 },
  'story': { maxRequests: 3, windowMs: 60000 },
  'brand': { maxRequests: 5, windowMs: 60000 },
  'tagline': { maxRequests: 5, windowMs: 60000 },
  'prd': { maxRequests: 10, windowMs: 60000 },
  'code-validate': { maxRequests: 8, windowMs: 60000 },
  'code-enhance': { maxRequests: 5, windowMs: 60000 },
  'code-generate': { maxRequests: 3, windowMs: 60000 },
  'analysis': { maxRequests: 10, windowMs: 60000 },
  'default': { maxRequests: 20, windowMs: 60000 }
}

export const TOKEN_COSTS = {
  'deepseek-chat': {
    input: 0.00014 / 1000,
    output: 0.00028 / 1000
  }
}

export class RateLimiter {
  private storageKey: string
  private config: RateLimitConfig
  private usageKey: string

  constructor(endpoint: string, customConfig?: Partial<RateLimitConfig>) {
    this.storageKey = `rate-limit-${endpoint}`
    this.usageKey = `usage-stats-${endpoint}`
    const defaultConfig = RATE_LIMIT_CONFIGS[endpoint] || RATE_LIMIT_CONFIGS['default']
    this.config = { ...defaultConfig, ...customConfig }
  }

  async checkLimit(): Promise<{ allowed: boolean; retryAfter?: number; remaining: number }> {
    const state = await this.getState()
    const now = Date.now()

    if (now >= state.resetAt) {
      await this.resetState()
      return { allowed: true, remaining: this.config.maxRequests - 1 }
    }

    if (state.count >= this.config.maxRequests) {
      const retryAfter = state.resetAt - now
      return { allowed: false, retryAfter, remaining: 0 }
    }

    return { allowed: true, remaining: this.config.maxRequests - state.count }
  }

  async recordRequest(): Promise<void> {
    const state = await this.getState()
    const now = Date.now()

    const newState: RateLimitState = now >= state.resetAt
      ? { count: 1, resetAt: now + this.config.windowMs, blocked: false }
      : {
          count: state.count + 1,
          resetAt: state.resetAt,
          blocked: state.count + 1 >= this.config.maxRequests
        }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(newState))
    } catch {}
  }

  async recordUsage(
    success: boolean,
    tokens?: { prompt: number; completion: number; total: number }
  ): Promise<void> {
    const stats = await this.getUsageStats()
    const now = Date.now()

    const updatedStats: UsageStats = {
      totalCalls: stats.totalCalls + 1,
      successfulCalls: success ? stats.successfulCalls + 1 : stats.successfulCalls,
      failedCalls: success ? stats.failedCalls : stats.failedCalls + 1,
      blockedCalls: stats.blockedCalls,
      lastCallAt: now,
      callsByEndpoint: {
        ...stats.callsByEndpoint,
        [this.storageKey]: (stats.callsByEndpoint[this.storageKey] || 0) + 1
      },
      tokenUsage: tokens ? {
        promptTokens: stats.tokenUsage.promptTokens + tokens.prompt,
        completionTokens: stats.tokenUsage.completionTokens + tokens.completion,
        totalTokens: stats.tokenUsage.totalTokens + tokens.total
      } : stats.tokenUsage,
      costEstimate: tokens ? 
        stats.costEstimate + this.calculateCost(tokens.prompt, tokens.completion) :
        stats.costEstimate
    }

    try {
      localStorage.setItem(this.usageKey, JSON.stringify(updatedStats))
    } catch {}
  }

  async recordBlocked(): Promise<void> {
    const stats = await this.getUsageStats()
    const updated = { ...stats, blockedCalls: stats.blockedCalls + 1 }
    try {
      localStorage.setItem(this.usageKey, JSON.stringify(updated))
    } catch {}
  }

  private async getState(): Promise<RateLimitState> {
    try {
      const raw = localStorage.getItem(this.storageKey)
      if (raw) {
        const state = JSON.parse(raw) as RateLimitState
        if (state && typeof state.count === 'number') return state
      }
    } catch {}
    return {
      count: 0,
      resetAt: Date.now() + this.config.windowMs,
      blocked: false
    }
  }

  private async resetState(): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        count: 0,
        resetAt: Date.now() + this.config.windowMs,
        blocked: false
      }))
    } catch {}
  }

  async getUsageStats(): Promise<UsageStats> {
    try {
      const raw = localStorage.getItem(this.usageKey)
      if (raw) {
        const stats = JSON.parse(raw) as UsageStats
        if (stats) return stats
      }
    } catch {}
    return {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      blockedCalls: 0,
      lastCallAt: 0,
      callsByEndpoint: {},
      tokenUsage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      },
      costEstimate: 0
    }
  }

  private calculateCost(promptTokens: number, completionTokens: number): number {
    const costs = TOKEN_COSTS['deepseek-chat']
    return (promptTokens * costs.input) + (completionTokens * costs.output)
  }

  async getRemainingQuota(): Promise<{ remaining: number; resetsIn: number }> {
    const state = await this.getState()
    const now = Date.now()
    
    if (now >= state.resetAt) {
      return { remaining: this.config.maxRequests, resetsIn: 0 }
    }

    return {
      remaining: Math.max(0, this.config.maxRequests - state.count),
      resetsIn: state.resetAt - now
    }
  }

  async clearStats(): Promise<void> {
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(this.usageKey)
    } catch {}
  }
}

export async function getGlobalUsageStats(): Promise<UsageStats> {
  const aggregated: UsageStats = {
    totalCalls: 0, successfulCalls: 0, failedCalls: 0, blockedCalls: 0, lastCallAt: 0,
    callsByEndpoint: {},
    tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    costEstimate: 0
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('usage-stats-')) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const stats = JSON.parse(raw) as UsageStats
          if (stats) {
            aggregated.totalCalls += stats.totalCalls
            aggregated.successfulCalls += stats.successfulCalls
            aggregated.failedCalls += stats.failedCalls
            aggregated.blockedCalls += stats.blockedCalls
            aggregated.lastCallAt = Math.max(aggregated.lastCallAt, stats.lastCallAt)
            aggregated.tokenUsage.promptTokens += stats.tokenUsage.promptTokens
            aggregated.tokenUsage.completionTokens += stats.tokenUsage.completionTokens
            aggregated.tokenUsage.totalTokens += stats.tokenUsage.totalTokens
            aggregated.costEstimate += stats.costEstimate
            Object.entries(stats.callsByEndpoint).forEach(([e, c]) => {
              aggregated.callsByEndpoint[e] = (aggregated.callsByEndpoint[e] || 0) + c
            })
          }
        }
      }
    }
  } catch {}

  return aggregated
}

export async function clearAllRateLimits(): Promise<void> {
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('rate-limit-') || key.startsWith('usage-stats-'))) {
        toRemove.push(key)
      }
    }
    toRemove.forEach(key => localStorage.removeItem(key))
  } catch {}
}

export function formatTimeRemaining(ms: number): string {
  if (ms < 1000) return 'less than a second'
  const seconds = Math.ceil(ms / 1000)
  if (seconds < 60) return `${seconds} second${seconds > 1 ? 's' : ''}`
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}

export function formatCost(cost: number): string {
  if (cost < 0.001) return '< $0.001'
  return `$${cost.toFixed(3)}`
}
