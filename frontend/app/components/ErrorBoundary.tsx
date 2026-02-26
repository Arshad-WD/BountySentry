"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Card from "./Card";
import Button from "./Button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <Card className="max-w-xl w-full p-12 text-center space-y-8 border-red-500/20 bg-red-500/[0.02]">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto text-red-500">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">System Fault Detected</h2>
              <p className="text-brand-secondary text-sm font-medium leading-relaxed">
                The protocol encountered an unexpected runtime exception. This has been logged for the developers.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-left overflow-auto max-h-40">
              <code className="text-[10px] text-red-400 font-mono break-all">
                {this.state.error?.toString()}
              </code>
            </div>

            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-500 hover:bg-red-600 border-red-500"
            >
              Re-Initialize Protocol
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
