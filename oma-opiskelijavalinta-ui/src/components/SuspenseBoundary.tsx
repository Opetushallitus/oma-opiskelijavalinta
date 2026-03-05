import { ErrorBoundary } from 'react-error-boundary';
import { Suspense } from 'react';
import { type ErrorBoundaryPropsWithRender } from 'react-error-boundary';
import { ErrorView } from './ErrorView';
import { FullSpinner } from './FullSpinner';
import { LocalizationProvider } from '@/components/LocalizationProvider';

type FallbackRenderType = ErrorBoundaryPropsWithRender['fallbackRender'];

const errorFallbackRender: FallbackRenderType = ({
  resetErrorBoundary,
  error,
}) => (
  <LocalizationProvider>
    <ErrorView error={error as Error} reset={resetErrorBoundary} />
  </LocalizationProvider>
);

export const SuspenseBoundary = ({
  children,
  suspenseFallback,
  onResetErrorBoundary,
}: {
  children: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  onResetErrorBoundary?: () => void;
}) => {
  return (
    <ErrorBoundary
      fallbackRender={errorFallbackRender}
      onReset={onResetErrorBoundary}
    >
      <Suspense fallback={suspenseFallback ?? <FullSpinner />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
