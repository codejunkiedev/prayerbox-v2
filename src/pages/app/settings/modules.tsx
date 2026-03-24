import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { ModulesSection } from '@/components/settings';
import { PageHeader } from '@/components/common';
import { Button } from '@/components/ui';
import { AppRoutes } from '@/constants';

export default function ModulesSettings() {
  return (
    <div className='container mx-auto py-8 space-y-6'>
      <div className='flex items-center gap-4'>
        <Link to={AppRoutes.Settings}>
          <Button variant='ghost' size='sm'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Settings
          </Button>
        </Link>
      </div>
      <PageHeader title='Module Settings' description='View display modules' />
      <ModulesSection />
    </div>
  );
}
