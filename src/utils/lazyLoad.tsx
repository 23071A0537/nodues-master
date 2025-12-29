import React, { lazy, ComponentType, Suspense } from "react";

/**
 * Utility function for lazy loading React components
 * @param importFunc - Dynamic import function that returns a Promise with the component
 * @param fallback - Optional fallback component to show while loading (defaults to spinner)
 * @returns A component that lazy loads the target component
 */
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(importFunc);

  const defaultFallback = (
    <div
      className="spinner-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "400px",
      }}
    >
      <div className="spinner" />
    </div>
  );

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Alternative: Create a HOC (Higher-Order Component) for lazy loading
 */
export const withLazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  LoadingComponent?: React.ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  const Fallback = LoadingComponent || DefaultLoadingSpinner;

  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<Fallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Custom loading spinner component
 */
export const DefaultLoadingSpinner: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
      fontFamily: "var(--font-family)",
    }}
  >
    <div className="spinner" />
  </div>
);
