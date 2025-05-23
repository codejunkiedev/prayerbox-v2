import { Button, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Plus, Settings } from 'lucide-react';
import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  showSettingsButton?: boolean;
  onSettingsClick?: () => void;
  rightContent?: ReactNode;
};

export function PageHeader({
  title,
  description,
  showAddButton = true,
  addButtonText = 'Add New',
  onAddClick,
  showSettingsButton = false,
  onSettingsClick,
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
          {rightContent || (
            <div className='flex gap-2'>
              {showSettingsButton && onSettingsClick && (
                <Button onClick={onSettingsClick} className='flex items-center gap-2'>
                  <Settings size={16} />
                  Settings
                </Button>
              )}
              {showAddButton && onAddClick && (
                <Button onClick={onAddClick}>
                  <Plus className='mr-2 h-4 w-4' /> {addButtonText}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
