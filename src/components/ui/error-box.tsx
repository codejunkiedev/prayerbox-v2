import React from 'react';
import { cn } from '@/utils';

interface ErrorBoxProps {
  message: string;
  className?: string;
}

export const ErrorBox: React.FC<ErrorBoxProps> = ({ message, className }) => {
  if (!message) return null;
  return (
    <div
      className={cn(
        'bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm',
        className
      )}
    >
      {message}
    </div>
  );
};
