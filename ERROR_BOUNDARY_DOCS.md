# Error Boundary System

## Overview

The Spark الشرارة application implements a comprehensive error boundary system that wraps each phase component to prevent crashes and provide graceful error recovery. This ensures users never lose their progress due to runtime errors in any specific phase.

## Architecture

### PhaseErrorBoundary Component

Located at: `/src/components/PhaseErrorBoundary.tsx`

This is a React class component that implements the error boundary pattern. It wraps individual phase components and catches JavaScript errors anywhere in their child component tree.

#### Key Features:

1. **Error Isolation**: Errors in one phase don't crash the entire application
2. **Progress Preservation**: User progress is always saved before errors occur
3. **Bilingual Support**: Full support for English and Arabic error messages
4. **Detailed Error Information**: Provides technical details for debugging
5. **User-Friendly Recovery**: Multiple recovery options (retry, return to dashboard)
6. **Error Reporting**: Copy-to-clipboard functionality for error details

### Integration in App.tsx

Each phase is wrapped with the `PhaseErrorBoundary` component in the `renderPhase` function:

```tsx
const renderPhase = () => {
  const currentPhase = route.view === 'phase' ? route.phase : journey.currentPhase
  
  const getPhaseComponent = () => {
    switch (currentPhase) {
      case 'brainstorm':
        return <BrainstormPhase journey={journey} onComplete={handleBrainstormComplete} />
      case 'story':
        return <StoryPhase journey={journey} onComplete={handlePhaseComplete} />
      // ... other phases
    }
  }

  return (
    <PhaseErrorBoundary
      phaseName={t.phases[currentPhase]}
      phaseKey={currentPhase}
      onReturnToDashboard={handleReturnToDashboard}
      language={language}
    >
      {getPhaseComponent()}
    </PhaseErrorBoundary>
  )
}
```

## Usage

### Props Interface

```typescript
interface PhaseErrorBoundaryProps {
  children: ReactNode              // The phase component to wrap
  phaseName: string                // Localized name of the phase
  phaseKey: PhaseKey              // Phase identifier (brainstorm, story, etc.)
  onRetry?: () => void            // Optional retry callback
  onReturnToDashboard?: () => void // Callback to return to dashboard
  language?: Language             // Current language (en or ar)
}
```

### State Interface

```typescript
interface PhaseErrorBoundaryState {
  hasError: boolean                 // Whether an error has occurred
  error: Error | null               // The caught error object
  errorInfo: React.ErrorInfo | null // React error information
  showDetails: boolean              // Whether to show technical details
}
```

## Error Handling Flow

1. **Error Occurs**: A runtime error happens in a phase component
2. **Error Caught**: `PhaseErrorBoundary` catches the error via `componentDidCatch`
3. **State Updated**: Error state is set, causing re-render
4. **Error UI Displayed**: User sees a friendly error message
5. **Recovery Options**:
   - **Retry**: Clears error state and attempts to re-render the phase
   - **Return to Dashboard**: Navigates back to the main dashboard
   - **Copy Error**: Copies detailed error information for support

## Error Display

The error boundary displays:

1. **Alert Banner**: Red alert with phase name and error description
2. **Error Type**: The JavaScript error type (e.g., TypeError, ReferenceError)
3. **Error Message**: The human-readable error message
4. **Technical Details** (collapsible):
   - Full stack trace
   - Component stack trace
   - Environment information (URL, user agent, timestamp)

## Translations

Error messages are fully localized in `/src/lib/i18n.ts`:

### English
```typescript
errorBoundary: {
  phaseError: 'Phase Error Detected',
  encounteredError: 'encountered an unexpected error...',
  errorType: 'Error Type',
  errorMessage: 'Error Message',
  stackTrace: 'Stack Trace',
  showDetails: 'Show Technical Details',
  hideDetails: 'Hide Technical Details',
  copyError: 'Copy Error Info',
  copied: 'Error details copied to clipboard',
  copyFailed: 'Failed to copy error details',
  tip: 'Your progress has been saved...',
  persistsMessage: 'If this error persists...',
}
```

### Arabic
```typescript
errorBoundary: {
  phaseError: 'خطأ في المرحلة',
  encounteredError: 'واجه خطأ غير متوقع...',
  errorType: 'نوع الخطأ',
  errorMessage: 'رسالة الخطأ',
  stackTrace: 'تتبع المكدس',
  showDetails: 'إظهار التفاصيل التقنية',
  hideDetails: 'إخفاء التفاصيل التقنية',
  copyError: 'نسخ معلومات الخطأ',
  copied: 'تم نسخ تفاصيل الخطأ',
  copyFailed: 'فشل نسخ تفاصيل الخطأ',
  tip: 'تم حفظ تقدمك...',
  persistsMessage: 'إذا استمر هذا الخطأ...',
}
```

## Benefits

### For Users
- Never lose progress due to errors
- Clear, actionable error messages
- Easy recovery options
- Consistent experience in both languages

### For Developers
- Isolated error handling per phase
- Detailed error information for debugging
- Consistent error UI across the app
- Easy to extend for new phases

### For Support
- Users can easily copy error details
- Full stack traces and environment info
- Timestamps for tracking issues
- Clear phase identification

## Best Practices

1. **Always Wrap Phases**: Ensure all phase components are wrapped with the error boundary
2. **Provide Callbacks**: Pass `onReturnToDashboard` to give users an escape route
3. **Use Translations**: Always use localized error messages
4. **Log Errors**: Errors are logged to console for debugging
5. **Test Error States**: Deliberately trigger errors to test the boundary

## Testing Error Boundaries

To test the error boundary in development:

```tsx
// Temporarily add to any phase component
if (process.env.NODE_ENV === 'development') {
  throw new Error('Test error boundary')
}
```

## Future Enhancements

Potential improvements to the error boundary system:

1. **Error Analytics**: Send error reports to analytics service
2. **Automatic Recovery**: Implement automatic retry logic for transient errors
3. **Error Context**: Add more context about user actions before error
4. **Fallback Components**: Phase-specific fallback UIs
5. **Error History**: Track errors per session for pattern detection

## Related Files

- `/src/components/PhaseErrorBoundary.tsx` - Main error boundary component
- `/src/App.tsx` - Integration point for phase wrapping
- `/src/lib/i18n.ts` - Error message translations
- `/src/ErrorFallback.tsx` - Global app-level error fallback

## Maintenance

When adding new phases:
1. Ensure they're wrapped in `PhaseErrorBoundary` in `App.tsx`
2. Test error scenarios specific to that phase
3. Update documentation if special handling is needed
