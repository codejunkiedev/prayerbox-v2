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

export function ModuleCard({ title, description, icon, path, color }: ModuleCardProps) {
  return (
    <Card className={`overflow-hidden border h-full flex flex-col ${color}`}>
      <CardHeader className='px-6 py-2 flex-grow'>
        <div className='flex justify-between items-center'>{icon}</div>
        <CardTitle className='mt-4'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
