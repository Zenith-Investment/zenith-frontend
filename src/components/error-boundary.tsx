"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });

    // Send error to monitoring service (e.g., Sentry)
    // if (typeof window !== "undefined") {
    //   Sentry.captureException(error, { extra: { errorInfo } });
    // }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-xl">Algo deu errado</CardTitle>
              <CardDescription>
                Ocorreu um erro inesperado. Tente recarregar a pagina ou voltar para a tela inicial.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p className="font-medium text-destructive mb-1">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={this.handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Inicio
              </Button>
              <Button className="flex-1" onClick={this.handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Recarregar
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary wrapper for functional components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Page-level error boundary with full-page styling
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Erro na pagina</CardTitle>
              <CardDescription className="text-base">
                Desculpe, algo deu errado ao carregar esta pagina.
                Nossa equipe foi notificada e estamos trabalhando para resolver.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => (window.location.href = "/dashboard")}
              >
                <Home className="mr-2 h-4 w-4" />
                Voltar para o inicio
              </Button>
            </CardFooter>
          </Card>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
