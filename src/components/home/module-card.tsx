import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button, Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui';

export type ModuleCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  path: string;
  color: string;
};

/**
 * Module card component displaying a clickable card for navigating to different modules
 * @param props Component props containing title, description, icon, navigation path, and color
 */
export function ModuleCard({ title, description, icon, path, color }: ModuleCardProps) {
  return (
    <Card className={`overflow-hidden border h-full flex flex-col ${color}`}>
      <CardHeader className='px-6 py-4 flex-grow'>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0 pt-1'>{icon}</div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className='mt-1.5'>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardFooter className='flex justify-between items-center px-6'>
        <Link to={path}>
          <Button>
            Go to {title}
            <ChevronRight className='ml-1 h-4 w-4' />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
