import { Pencil } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button } from '@/components/ui';
import { DataTable } from '@/components/common';
import { AppRoutes, MODULES } from '@/constants';
import type { Column } from '@/components/common/data-table';

type Module = (typeof MODULES)[number];

/**
 * Component that displays application modules with navigation links
 * to manage individual module content.
 */
export function ModulesSection() {
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
      width: 'w-[90%]',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Settings</CardTitle>
        <CardDescription>
          Click "Manage" to go to a module's page to manage its content.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <DataTable<Module> columns={columns} data={MODULES} keyField='id' showRowNumbers={true} />
      </CardContent>
    </Card>
  );
}
