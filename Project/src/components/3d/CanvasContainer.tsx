import React, { Component, ReactNode, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('Canvas 3D Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-6 bg-slate-950/80 border border-emerald-500/20 rounded-2xl text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
            <span className="text-emerald-400 font-mono text-xl">3D</span>
          </div>
          <p className="text-slate-300 font-medium">3D Acceleration Paused</p>
          <p className="text-slate-500 text-xs mt-1 max-w-xs">
            WebGL is operating in lightweight fallback mode for maximum device compatibility.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface CanvasContainerProps {
  children: ReactNode;
  className?: string;
  camera?: any;
  shadows?: boolean;
  fallbackText?: string;
  staticFallback?: ReactNode;
}

export function CanvasLoadingFallback({ text = 'Loading 3D Scene...' }: { text?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm z-10">
      <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
      <span className="text-xs uppercase tracking-widest text-emerald-400/80 font-mono">
        {text}
      </span>
    </div>
  );
}

export default function CanvasContainer({
  children,
  className = 'w-full h-full relative',
  camera = { position: [0, 0, 5], fov: 50 },
  shadows = false,
  fallbackText,
  staticFallback,
}: CanvasContainerProps) {
  return (
    <div className={className}>
      <CanvasErrorBoundary fallback={staticFallback}>
        <Suspense fallback={<CanvasLoadingFallback text={fallbackText} />}>
          <Canvas
            camera={camera}
            shadows={shadows}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          >
            {children}
          </Canvas>
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  );
}
