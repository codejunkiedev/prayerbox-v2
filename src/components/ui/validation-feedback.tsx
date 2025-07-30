import { cn } from '@/lib/utils';
import type { ValidationFeedbackProps } from '@/types/validation';

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
          'p-3 rounded-md text-sm bg-blue-50 border border-blue-200 text-blue-800',
          className
        )}
      >
        <div className='flex items-center space-x-2'>
          <div className='animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full' />
          <span>Validating image...</span>
        </div>
      </div>
    );
  }

  const baseClasses = 'p-3 rounded-md text-sm';
  const validClasses = 'bg-green-50 border border-green-200 text-green-800';
  const invalidClasses = 'bg-yellow-50 border border-yellow-200 text-yellow-800';

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

function ValidationSuccessContent({ dimensions }: { dimensions?: string }) {
  return (
    <div className='flex items-start space-x-2'>
      <CheckIcon className='w-4 h-4 mt-0.5 text-green-600' />
      <div>
        <p className='font-medium'>Image validated for full-screen display</p>
        {dimensions && <p className='text-xs mt-1'>Dimensions: {dimensions}</p>}
      </div>
    </div>
  );
}

function ValidationWarningContent({
  dimensions,
  recommendation,
}: {
  dimensions?: string;
  recommendation?: string;
}) {
  return (
    <div className='flex items-start space-x-2'>
      <WarningIcon className='w-4 h-4 mt-0.5 text-yellow-600' />
      <div>
        <p className='font-medium'>Image may not display optimally</p>
        {dimensions && <p className='text-xs mt-1'>Current: {dimensions}</p>}
        {recommendation && (
          <p className='text-xs mt-1' dangerouslySetInnerHTML={{ __html: recommendation }} />
        )}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='currentColor' viewBox='0 0 20 20'>
      <path
        fillRule='evenodd'
        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
        clipRule='evenodd'
      />
    </svg>
  );
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill='currentColor' viewBox='0 0 20 20'>
      <path
        fillRule='evenodd'
        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
        clipRule='evenodd'
      />
    </svg>
  );
}
