import { cn } from '@/utils';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { ValidationFeedbackProps } from '@/types/validation';

/**
 * Visual feedback component displaying image validation results with status indicators
 */
export function ValidationFeedback({
  isValid,
  dimensions,
  recommendation,
  isLoading = false,
  className,
}: ValidationFeedbackProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'p-3 rounded-md text-sm bg-primary/10 border border-primary/20 text-primary',
          className
        )}
      >
        <div className='flex items-center space-x-2'>
          <Loader2 className='animate-spin w-4 h-4' />
          <span>Validating image...</span>
        </div>
      </div>
    );
  }

  const baseClasses = 'p-3 rounded-md text-sm';
  const validClasses =
    'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400';
  const invalidClasses =
    'bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400';

  return (
    <div className={cn(baseClasses, isValid ? validClasses : invalidClasses, className)}>
      {isValid ? (
        <ValidationSuccessContent dimensions={dimensions} />
      ) : (
        <ValidationWarningContent dimensions={dimensions} recommendation={recommendation} />
      )}
    </div>
  );
}

/**
 * Success state content showing valid image confirmation with dimensions
 */
function ValidationSuccessContent({ dimensions }: { dimensions?: string }) {
  return (
    <div className='flex items-start space-x-2'>
      <CheckCircle className='w-4 h-4 mt-0.5 text-green-600 dark:text-green-400' />
      <div>
        <p className='font-medium'>Image validated for full-screen display</p>
        {dimensions && <p className='text-xs mt-1 opacity-80'>Dimensions: {dimensions}</p>}
      </div>
    </div>
  );
}

/**
 * Warning state content showing validation issues and recommendations
 */
function ValidationWarningContent({
  dimensions,
  recommendation,
}: {
  dimensions?: string;
  recommendation?: string;
}) {
  return (
    <div className='flex items-start space-x-2'>
      <AlertTriangle className='w-4 h-4 mt-0.5 text-yellow-600 dark:text-yellow-400' />
      <div>
        <p className='font-medium'>Image may not display optimally</p>
        {dimensions && <p className='text-xs mt-1 opacity-80'>Current: {dimensions}</p>}
        {recommendation && <p className='text-xs mt-1 opacity-90'>{recommendation}</p>}
      </div>
    </div>
  );
}
