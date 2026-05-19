import { FullSpinner } from './FullSpinner';
import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { SuspenseBoundary } from './SuspenseBoundary';

export function QuerySuspenseBoundary({
  children,
  suspenseFallback,
  errorFallback,
}: {
  children: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}) {
  const { reset } = useQueryErrorResetBoundary();
  return (
    <SuspenseBoundary
      onResetErrorBoundary={reset}
      suspenseFallback={suspenseFallback ?? <FullSpinner />}
      errorFallback={errorFallback}
    >
      {children}
    </SuspenseBoundary>
  );
}
