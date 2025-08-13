import { Link } from 'react-router';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui';

export type QuickActionButtonProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  path: string;
};

/**
 * Quick action button component providing navigation shortcuts on dashboard
 * @param props Component props containing title, description, optional icon, and navigation path
 */
export function QuickActionButton({ title, description, icon, path }: QuickActionButtonProps) {
  return (
    <Link to={path} className='block'>
      <Button variant='outline' className='w-full h-auto p-0 overflow-hidden'>
        <div className='flex w-full p-4'>
          {icon && <span className='mr-3 pt-2 flex-shrink-0'>{icon}</span>}
          <div className='text-left min-w-0 flex-1'>
            <div className='font-medium truncate'>{title}</div>
            <div className='text-sm text-gray-500 dark:text-gray-400 pr-4'>{description}</div>
          </div>
        </div>
      </Button>
    </Link>
  );
}
