import { BookOpen, Bell, Calendar, User } from 'lucide-react';
import { AppRoutes } from '@/constants';
import { ModuleCard, QuickActionButton, WelcomeHeader, SectionTitle } from '@/components/home';

export default function Home() {
  const modules = [
    {
      title: 'Ayat & Hadith',
      description: 'Manage your collection of Quranic verses and Hadith',
      icon: <BookOpen className='h-10 w-10 text-primary' />,
      path: AppRoutes.AyatAndHadith,
      color: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      title: 'Announcements',
      description: 'Create and manage masjid announcements for your community',
      icon: <Bell className='h-10 w-10 text-primary' />,
      path: AppRoutes.Announcements,
      color: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      title: 'Events',
      description: 'Schedule and manage upcoming events for your masjid',
      icon: <Calendar className='h-10 w-10 text-primary' />,
      path: AppRoutes.Events,
      color: 'bg-amber-50 dark:bg-amber-950/30',
    },
  ];

  const quickActions = [
    {
      title: 'Add Ayat or Hadith',
      description: 'Share wisdom with your community',
      icon: <BookOpen className='h-5 w-5' />,
      path: AppRoutes.AyatAndHadith,
    },
    {
      title: 'Create Announcement',
      description: 'Keep your community informed',
      icon: <Bell className='h-5 w-5' />,
      path: AppRoutes.Announcements,
    },
    {
      title: 'Schedule Event',
      description: 'Plan your next gathering',
      icon: <Calendar className='h-5 w-5' />,
      path: AppRoutes.Events,
    },
    {
      title: 'Update Profile',
      description: 'Manage your masjid information',
      icon: <User className='h-5 w-5' />,
      path: AppRoutes.Profile,
    },
  ];

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <WelcomeHeader
        title='Welcome to PrayerBox'
        subtitle="Manage all your masjid's digital needs in one place"
      />

      <div className='overflow-x-auto pb-4'>
        <div className='flex md:grid md:grid-cols-3 gap-6' style={{ minWidth: 'min-content' }}>
          {modules.map((module, index) => (
            <div key={module.path} className='w-[320px] md:w-auto flex-shrink-0'>
              <ModuleCard
                title={module.title}
                description={module.description}
                icon={module.icon}
                path={module.path}
                color={module.color}
                key={index}
              />
            </div>
          ))}
        </div>
      </div>

      <div className='mt-12'>
        <SectionTitle title='Quick Actions' />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {quickActions.map((action, index) => (
            <QuickActionButton
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              path={action.path}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
