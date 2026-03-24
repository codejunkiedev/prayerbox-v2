import { Button, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';
import { Plus, Settings } from 'lucide-react';

type PageHeaderProps = {
  title: string;
  description: string;
  showAddButton?: boolean;
  addButtonText?: string;
  onAddClick?: () => void;
  showSettingsButton?: boolean;
  onSettingsClick?: () => void;
};

/**
 * Page header component with title, description, and optional action buttons
 * Supports add and settings functionality
 * @param props Component props containing header content and button configurations
 */
export function PageHeader({
  title,
  description,
  showAddButton = true,
  addButtonText = 'Add New',
  onAddClick,
  showSettingsButton = false,
  onSettingsClick,
}: PageHeaderProps) {
  const isRightContent = showAddButton || showSettingsButton;

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <div className='space-y-1'>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {isRightContent && (
            <div className='flex gap-2'>
              {showSettingsButton && onSettingsClick && (
                <Button onClick={onSettingsClick}>
                  <Settings className='mr-2 h-4 w-4' />
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
