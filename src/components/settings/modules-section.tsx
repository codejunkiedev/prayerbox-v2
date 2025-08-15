import { Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Switch,
  Button,
} from '@/components/ui';
import { TableSkeleton } from '@/components/skeletons/table-skeleton';
import { DraggableDataTable } from '@/components/common';
import { AppRoutes } from '@/constants';
import { updateSettings } from '@/lib/supabase';
import type { Module, Settings } from '@/types';
import type { Column } from '@/components/common/data-table';

interface ModulesSectionProps {
  settings: Settings | null;
  onSettingsChange: (settings: Settings) => void;
  isLoading: boolean;
}

/**
 * Component that manages application module settings, allowing users to reorder modules
 * via drag-and-drop and toggle module visibility. Includes navigation links to manage
 * individual module content.
 */
export function ModulesSection({ settings, onSettingsChange, isLoading }: ModulesSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Maps module names to their corresponding application routes
   */
  const getModuleRoute = (moduleName: string): string => {
    switch (moduleName) {
      case 'Ayats & Hadiths':
        return AppRoutes.AyatAndHadith;
      case 'Announcements':
        return AppRoutes.Announcements;
      case 'Events':
        return AppRoutes.Events;
      case 'Posts':
        return AppRoutes.Posts;
      default:
        return AppRoutes.Home;
    }
  };

  const columns: Column<Module>[] = [
    {
      key: 'name',
      name: 'Module',
      width: 'w-[80%]',
    },
    {
      key: 'toggle',
      name: 'Visible',
      width: 'w-[10%]',
      className: 'text-center',
      render: (_, item) => (
        <Switch
          checked={item.enabled}
          onCheckedChange={checked => handleToggleModule(item.id, checked)}
          disabled={isSaving}
        />
      ),
    },
    {
      key: 'manage',
      name: 'Manage',
      width: 'w-[10%]',
      className: 'text-center',
      render: (_, item) => (
        <Link to={getModuleRoute(item.name)}>
          <Button size='sm' variant='secondary' className='cursor-pointer'>
            <Pencil className='h-4 w-4' />
          </Button>
        </Link>
      ),
    },
  ];

  /**
   * Updates the display order of modules when they are reordered via drag-and-drop
   */
  const handleOrderChange = async (items: Module[]) => {
    if (!settings) return;

    const isInOrder = items.every((item, index) => item.display_order === index + 1);
    if (isInOrder) return;

    try {
      setIsSaving(true);
      const updatedModules = items.map((item, index) => ({ ...item, display_order: index + 1 }));
      const updatedSettings = await updateSettings(updatedModules);
      onSettingsChange(updatedSettings);
      toast.success('Order updated successfully');
    } catch (error) {
      console.error('Error updating module order:', error);
      toast.error('Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Toggles the visibility of a module and saves the change to the database
   */
  const handleToggleModule = async (id: string, enabled: boolean) => {
    if (!settings) return;

    const currentModule = settings.modules.find(module => module.id === id);
    if (currentModule?.enabled === enabled) return;

    try {
      setIsSaving(true);
      const updatedModules = settings.modules.map(module =>
        module.id === id ? { ...module, enabled } : module
      );
      const updatedSettings = await updateSettings(updatedModules);
      onSettingsChange(updatedSettings);
      const moduleName = settings.modules.find(module => module.id === id)?.name;
      toast.success(`${moduleName} ${enabled ? 'will be visible' : 'will be hidden'} now.`);
    } catch (error) {
      console.error('Error toggling module:', error);
      toast.error('Failed to update module');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Settings</CardTitle>
        <CardDescription>
          Drag and drop to reorder modules or toggle to enable/disable modules.
          <br />
          Changes are saved automatically. Click "Manage" to go to a module's page to manage its
          content.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {isLoading ? (
          <TableSkeleton columns={columns} rows={4} showActions={false} showRowNumbers={true} />
        ) : (
          <DraggableDataTable<Module>
            columns={columns}
            data={settings?.modules || []}
            keyField='id'
            showRowNumbers={true}
            onOrderChange={handleOrderChange}
            isDraggable={!isSaving}
          />
        )}

        {isSaving && (
          <div className='flex items-center justify-center py-2'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <div className='animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full'></div>
              Saving settings...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
