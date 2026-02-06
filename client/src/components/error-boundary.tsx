import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
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

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
          <Card className="w-full max-w-lg border-red-200 shadow-lg">
            <CardHeader className="bg-red-50 border-b border-red-100 pb-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-6 w-6" />
                <CardTitle className="text-xl">Algo deu errado</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-slate-600">
                Ocorreu um erro inesperado na aplicação.
              </p>
              
              {this.state.error && (
                <div className="bg-slate-900 text-slate-50 p-4 rounded-md overflow-x-auto text-sm font-mono">
                  <p className="font-bold text-red-400 mb-2">{this.state.error.toString()}</p>
                  <p className="text-slate-400 whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack || this.state.error.stack}
                  </p>
                </div>
              )}

              <Button 
                onClick={() => window.location.href = "/"} 
                className="w-full bg-slate-900 hover:bg-slate-800"
              >
                Recarregar Aplicação
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
