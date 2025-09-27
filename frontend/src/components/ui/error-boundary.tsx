"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorDisplayProps {
  error?: Error | any
  onRetry?: () => void
  title?: string
  description?: string
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  description 
}: ErrorDisplayProps) {
  const errorMessage = error?.response?.data?.message || error?.message || "An unexpected error occurred"
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-red-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {description || errorMessage}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function ErrorPage({ 
  error, 
  onRetry,
  title = "Oops! Something went wrong",
  description = "We're sorry, but something unexpected happened. Please try again."
}: ErrorDisplayProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <ErrorDisplay 
        error={error}
        onRetry={onRetry}
        title={title}
        description={description}
      />
    </div>
  )
}
