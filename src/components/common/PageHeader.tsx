import { Button, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  rightContent?: ReactNode;
};

export function PageHeader({
  title,
  description,
  showAddButton = true,
  addButtonText = 'Add New',
  onAddClick,
  rightContent,
}: PageHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {rightContent ||
            (showAddButton && onAddClick && (
              <Button onClick={onAddClick}>
                <Plus className='mr-2 h-4 w-4' /> {addButtonText}
              </Button>
            ))}
        </div>
      </CardHeader>
    </Card>
  );
}
