# Rate Limiting and Usage Monitoring System

## Overview

A comprehensive rate limiting and usage monitoring system has been implemented to protect the application from API abuse, manage costs, and provide transparency to users about their AI API usage.

## Features

### 1. **Rate Limiting**
- **Per-Endpoint Limits**: Different rate limits for different API endpoints based on their resource intensity
- **Time-Window Based**: Uses a sliding window approach (default: 60 seconds)
- **Automatic Reset**: Limits automatically reset after the time window expires
- **Graceful Blocking**: When limits are exceeded, users receive clear feedback with retry time

### 2. **Usage Tracking**
- **Call Metrics**: Tracks total, successful, failed, and blocked API calls
- **Token Consumption**: Monitors prompt tokens, completion tokens, and total tokens used
- **Cost Estimation**: Calculates estimated costs based on DeepSeek API pricing
- **Endpoint Analysis**: Shows which endpoints are used most frequently
- **Last Call Timestamp**: Records when the last API call was made

### 3. **User Interface**
- **Usage Monitor Dashboard**: Comprehensive view of all usage statistics
- **Real-time Updates**: Auto-refreshes every 10 seconds
- **Visual Indicators**: Progress bars and badges for quick insights
- **Rate Limit Alerts**: Warning messages when approaching or exceeding limits
- **Clear Statistics**: Option to reset all usage data

## Rate Limit Configuration

### Default Limits (per 60 seconds):

| Endpoint | Max Requests | Use Case |
|----------|--------------|----------|
| `concepts` | 10 | Generate healthcare concepts |
| `refine` | 5 | Refine startup concepts |
| `story` | 3 | Generate founder stories |
| `brand` | 5 | Generate brand names |
| `tagline` | 5 | Generate taglines |
| `prd` | 10 | Generate PRD content |
| `code-validate` | 8 | Validate generated code |
| `code-enhance` | 5 | Enhance code quality |
| `code-generate` | 3 | Generate full applications |
| `analysis` | 10 | Analyze content quality |
| `default` | 20 | Other API calls |

### Rationale:
- **Code generation** (3 req/min): Most resource-intensive, longest response times
- **Story generation** (3 req/min): Medium complexity, narrative generation
- **Brand/PRD content** (5-10 req/min): Lighter operations, shorter responses
- **Analysis** (10 req/min): Quick validation and scoring operations

## Implementation Details

### Core Components

#### 1. RateLimiter Class (`src/lib/rateLimiter.ts`)
```typescript
const limiter = new RateLimiter('endpoint-name')

// Check if request is allowed
const { allowed, retryAfter, remaining } = await limiter.checkLimit()

// Record the request
await limiter.recordRequest()

// Record usage with token counts
await limiter.recordUsage(success, { prompt, completion, total })

// Record blocked request
await limiter.recordBlocked()

// Get current quota
const { remaining, resetsIn } = await limiter.getRemainingQuota()
```

#### 2. Usage Monitor Component (`src/components/UsageMonitor.tsx`)
- Dashboard displaying all usage statistics
- Real-time updates every 10 seconds
- Breakdown by endpoint
- Cost estimation display
- Clear statistics functionality

#### 3. Rate Limit Alert Component (`src/components/RateLimitAlert.tsx`)
- Shows warnings when approaching limits
- Displays blocked state when limit exceeded
- Shows time until reset
- Auto-updates every 5 seconds

### Integration with DeepSeek API

All DeepSeek API calls in `src/lib/deepseekHelper.ts` now:

1. Check rate limits before making requests
2. Record successful/failed requests with token usage
3. Track blocked requests when limits are exceeded
4. Throw descriptive errors with retry information

Example:
```typescript
async function callDeepSeek(
  prompt: string,
  temperature: number = 0.7,
  maxTokens: number = 2000,
  jsonMode: boolean = false,
  endpoint: string = 'default'
): Promise<string> {
  const rateLimiter = new RateLimiter(endpoint)
  
  // Check if allowed
  const limitCheck = await rateLimiter.checkLimit()
  if (!limitCheck.allowed) {
    await rateLimiter.recordBlocked()
    throw new Error(`Rate limit exceeded. Wait ${formatTime(limitCheck.retryAfter)}`)
  }
  
  // Record the request
  await rateLimiter.recordRequest()
  
  // Make API call...
  const response = await fetch(...)
  
  // Record usage with tokens
  await rateLimiter.recordUsage(true, {
    prompt: data.usage.prompt_tokens,
    completion: data.usage.completion_tokens,
    total: data.usage.total_tokens
  })
  
  return content
}
```

## Data Storage

All rate limiting and usage data is stored using the Spark KV store:

- **Rate Limit State**: `rate-limit-{endpoint}`
  - count: number of requests in current window
  - resetAt: timestamp when limit resets
  - blocked: boolean flag

- **Usage Statistics**: `usage-stats-{endpoint}`
  - totalCalls, successfulCalls, failedCalls, blockedCalls
  - tokenUsage (prompt, completion, total)
  - costEstimate
  - callsByEndpoint
  - lastCallAt

## Cost Calculation

Based on DeepSeek API pricing (as of implementation):
- Input tokens: $0.00014 per 1K tokens
- Output tokens: $0.00028 per 1K tokens

Formula:
```
cost = (promptTokens × 0.00014/1000) + (completionTokens × 0.00028/1000)
```

## User Experience

### Normal Operation
- Users can make API calls within defined limits
- Real-time feedback on remaining quota
- Transparent usage tracking

### Approaching Limit
- Warning alert appears showing remaining requests
- Progress bar indicates usage percentage
- Time until reset is displayed

### Limit Exceeded
- Clear error message with retry time
- Request is blocked automatically
- Blocked count is incremented
- User can wait for auto-reset

### Usage Monitor
- Accessible via "Usage" button in header
- Shows comprehensive statistics:
  - Total/successful/failed/blocked calls
  - Success rate percentage
  - Token consumption breakdown
  - Cost estimates
  - Top endpoints by usage
  - Last API call timestamp
- Refresh button for manual updates
- Clear stats button to reset all data

## Multilingual Support

All UI text fully supports English and Arabic:
- Alert messages
- Button labels
- Statistics labels
- Time formatting
- Error messages

## API Reference

### RateLimiter Methods

```typescript
// Check if request is allowed
checkLimit(): Promise<{ allowed: boolean; retryAfter?: number; remaining: number }>

// Record a request attempt
recordRequest(): Promise<void>

// Record usage statistics
recordUsage(success: boolean, tokens?: { prompt: number; completion: number; total: number }): Promise<void>

// Record a blocked request
recordBlocked(): Promise<void>

// Get current quota status
getRemainingQuota(): Promise<{ remaining: number; resetsIn: number }>

// Get usage statistics
getUsageStats(): Promise<UsageStats>

// Clear all data
clearStats(): Promise<void>
```

### Global Functions

```typescript
// Get aggregated usage across all endpoints
getGlobalUsageStats(): Promise<UsageStats>

// Clear all rate limit and usage data
clearAllRateLimits(): Promise<void>

// Format milliseconds to human-readable time
formatTimeRemaining(ms: number): string

// Format cost with proper decimal places
formatCost(cost: number): string
```

## Testing

### Manual Testing
1. Navigate to the Usage Monitor (`#/usage`)
2. Make several API calls (e.g., generate concepts, stories)
3. Observe stats updating in real-time
4. Try to exceed a rate limit
5. Verify error messages and retry times
6. Wait for limit reset
7. Test clearing statistics

### Recommended Tests
- [ ] Generate concepts until rate limit
- [ ] Verify blocked requests are counted
- [ ] Check token usage accuracy
- [ ] Validate cost calculations
- [ ] Test across multiple endpoints
- [ ] Verify auto-reset after time window
- [ ] Test clear statistics function
- [ ] Verify multilingual support

## Configuration

To modify rate limits, edit `RATE_LIMIT_CONFIGS` in `src/lib/rateLimiter.ts`:

```typescript
export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  'endpoint-name': { 
    maxRequests: 10,      // Maximum requests
    windowMs: 60000,      // Time window in milliseconds
    retryAfterMs: 5000    // Optional: custom retry delay
  },
  // ... other endpoints
}
```

To modify cost calculation, edit `TOKEN_COSTS` in `src/lib/rateLimiter.ts`:

```typescript
export const TOKEN_COSTS = {
  'deepseek-chat': {
    input: 0.00014 / 1000,   // Cost per token
    output: 0.00028 / 1000
  }
}
```

## Benefits

1. **Cost Control**: Prevents runaway API costs from excessive usage
2. **Performance**: Prevents API server overload
3. **User Transparency**: Users can see exactly how much they're using
4. **Fair Usage**: Ensures all users get fair access to resources
5. **Debugging**: Helps identify which features use the most resources
6. **Compliance**: Tracks usage for auditing and compliance purposes

## Future Enhancements

Potential improvements for future iterations:
- [ ] Per-user rate limits
- [ ] Dynamic rate limits based on time of day
- [ ] Premium tier with higher limits
- [ ] Email notifications on approaching limits
- [ ] Usage analytics and trends
- [ ] Export usage reports as CSV/PDF
- [ ] Integration with payment systems
- [ ] Webhook notifications for limit exceeded
- [ ] Custom rate limit profiles

## Troubleshooting

### Rate limits not working
- Check that Spark KV store is accessible
- Verify rate limiter is initialized with correct endpoint name
- Check browser console for errors

### Stats not updating
- Ensure auto-refresh is working (check interval is active)
- Manually click Refresh button
- Check that API calls are actually being made

### Incorrect token counts
- Verify DeepSeek API response includes usage data
- Check that response parsing is correct
- Validate token calculation logic

### Cost estimates seem wrong
- Verify TOKEN_COSTS values match current API pricing
- Check that token counts are accurate
- Ensure cost calculation formula is correct

## Support

For issues or questions about the rate limiting system, please:
1. Check this documentation
2. Review the implementation in `src/lib/rateLimiter.ts`
3. Test with the Usage Monitor at `#/usage`
4. Check browser console for error messages
