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

export function ModulesSection({ settings, onSettingsChange, isLoading }: ModulesSectionProps) {
  const [isSaving, setIsSaving] = useState(false);

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

  const handleOrderChange = async (items: Module[]) => {
    if (!settings) return;
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

  const handleToggleModule = async (id: string, enabled: boolean) => {
    if (!settings) return;
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
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
