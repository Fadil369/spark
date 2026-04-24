import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { AlertTriangleIcon, RefreshCwIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  if (import.meta.env.DEV) throw error;

  const errorInfo = {
    message: error?.message || 'Unknown error occurred',
    name: error?.name || 'Error',
    stack: error?.stack || 'No stack trace available',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  const copyErrorDetails = () => {
    const errorText = `Error Report
=============
Timestamp: ${errorInfo.timestamp}
Error Type: ${errorInfo.name}
Message: ${errorInfo.message}

Stack Trace:
${errorInfo.stack}

Environment:
- URL: ${errorInfo.url}
- User Agent: ${errorInfo.userAgent}
`;
    
    navigator.clipboard.writeText(errorText).then(() => {
      toast.success('Error details copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy error details');
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangleIcon />
          <AlertTitle>Runtime Error Detected</AlertTitle>
          <AlertDescription>
            The application encountered an unexpected error. Detailed debugging information is provided below to help resolve the issue.
          </AlertDescription>
        </Alert>
        
        <div className="bg-card border rounded-lg p-4 mb-4 space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Type:</h3>
            <div className="text-sm font-mono bg-muted/50 p-2 rounded border">
              {errorInfo.name}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Message:</h3>
            <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border overflow-auto max-h-24">
              {errorInfo.message}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Stack Trace:</h3>
            <pre className="text-xs font-mono bg-muted/50 p-3 rounded border overflow-auto max-h-48">
              {errorInfo.stack}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">Environment:</h3>
            <div className="text-xs font-mono bg-muted/50 p-3 rounded border space-y-1">
              <div><span className="text-muted-foreground">Timestamp:</span> {errorInfo.timestamp}</div>
              <div><span className="text-muted-foreground">URL:</span> {errorInfo.url}</div>
              <div className="break-all"><span className="text-muted-foreground">User Agent:</span> {errorInfo.userAgent}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={copyErrorDetails} 
            variant="outline"
            className="flex-1"
          >
            <CopyIcon className="w-4 h-4 mr-2" />
            Copy Error Details
          </Button>
          <Button 
            onClick={resetErrorBoundary} 
            className="flex-1"
          >
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>

        <div className="mt-4 text-xs text-center text-muted-foreground">
          <p>If this issue persists, please copy the error details and contact support.</p>
        </div>
      </div>
    </div>
  );
}
