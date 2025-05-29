import { useState, useEffect } from 'react';
import { DraggableDataTable } from '@/components/common/DraggableDataTable';
import type { Column } from '@/components/common/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { getOrCreateSettings, updateSettings } from '@/lib/supabase';
import type { Module, Settings } from '@/types';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { AppRoutes } from '@/constants';

export default function Settings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        setIsLoading(true);
        const userSettings = await getOrCreateSettings();
        if (userSettings) setSettings(userSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

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
      setSettings(updatedSettings);
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
      setSettings(updatedSettings);
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
    <div className='container mx-auto py-8 space-y-6'>
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
    </div>
  );
}
