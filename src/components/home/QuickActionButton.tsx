import { Link } from 'react-router';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui';

export type QuickActionButtonProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  path: string;
};

export function QuickActionButton({ title, description, icon, path }: QuickActionButtonProps) {
  return (
    <Link to={path} className='block'>
      <Button variant='outline' className='w-full h-auto p-4 justify-start'>
        {icon && <span className='mr-2'>{icon}</span>}
        <div className='text-left'>
          <div className='font-medium'>{title}</div>
          <div className='text-sm text-gray-500 dark:text-gray-400'>{description}</div>
        </div>
      </Button>
    </Link>
  );
}
