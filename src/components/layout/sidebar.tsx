import { Link, useLocation } from 'react-router';
import {
  ChevronLeft,
  Home,
  BookOpen,
  Bell,
  Clock,
  Settings,
  X,
  Images,
  Tickets,
} from 'lucide-react';
import { AppRoutes } from '@/constants';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import { useSidebarState } from '@/hooks';

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onClose, isMobile = false }: SidebarProps) {
  const [collapsed, toggleSidebar] = useSidebarState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    {
      label: 'Home',
      path: AppRoutes.Home,
      icon: <Home size={20} />,
    },
    {
      label: 'Ayat & Hadith',
      path: AppRoutes.AyatAndHadith,
      icon: <BookOpen size={20} />,
    },
    {
      label: 'Announcements',
      path: AppRoutes.Announcements,
      icon: <Bell size={20} />,
    },
    {
      label: 'Events',
      path: AppRoutes.Events,
      icon: <Tickets size={20} />,
    },
    {
      label: 'Posts',
      path: AppRoutes.Posts,
      icon: <Images size={20} />,
    },
    {
      label: 'Prayer Timings',
      path: AppRoutes.PrayerTimings,
      icon: <Clock size={20} />,
    },
    {
      label: 'Settings',
      path: AppRoutes.Settings,
      icon: <Settings size={20} />,
    },
  ];

  return (
    <div className='relative h-screen flex overflow-hidden'>
      {/* Main Sidebar */}
      <aside
        className={cn(
          'h-full bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-width duration-300 ease-in-out flex flex-col border-r border-slate-700/50 shadow-lg z-10 overflow-hidden',
          collapsed && !isMobile ? 'w-16' : 'w-64'
        )}
      >
        {/* Header */}
        <div className='p-4 flex items-center justify-between border-b border-slate-700/50'>
          <div
            className={cn(
              'flex items-center',
              collapsed && !isMobile ? 'w-full justify-center cursor-pointer' : ''
            )}
            onClick={collapsed && !isMobile ? toggleSidebar : undefined}
            title={collapsed && !isMobile ? 'Expand Sidebar' : undefined}
          >
            <div
              className={cn(
                'w-8 h-8 min-w-[32px] rounded-md bg-emerald-500 flex items-center justify-center transition-transform duration-200',
                collapsed && !isMobile ? 'hover:scale-110 mx-auto' : ''
              )}
            >
              <span className='font-bold text-white'>P</span>
            </div>
            <div
              className={cn(
                'ml-3 overflow-hidden transition-all duration-300 ease-in-out',
                collapsed && !isMobile ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100'
              )}
            >
              <h1 className='text-xl font-semibold whitespace-nowrap'>PrayerBox</h1>
            </div>
          </div>

          {isMobile ? (
            <Button
              variant='ghost'
              size='icon'
              className='text-white hover:bg-slate-700/50'
              onClick={onClose}
            >
              <X size={20} />
            </Button>
          ) : (
            !collapsed && (
              <Button
                variant='ghost'
                size='icon'
                className='text-white hover:bg-slate-700/50'
                onClick={toggleSidebar}
                aria-label='Collapse sidebar'
              >
                <ChevronLeft size={18} className='text-emerald-400' />
              </Button>
            )
          )}
        </div>

        {/* Navigation */}
        <nav className='flex-1 overflow-y-auto py-4'>
          <ul className={cn('space-y-1', collapsed && !isMobile ? 'px-2' : 'px-3')}>
            {navItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2.5 transition-all',
                    isActive(item.path)
                      ? 'bg-slate-700/70 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-700/40 hover:text-white',
                    collapsed && !isMobile ? 'justify-center px-2' : 'space-x-3'
                  )}
                  onClick={isMobile ? onClose : undefined}
                  title={collapsed && !isMobile ? item.label : undefined}
                >
                  <span
                    className={cn(
                      'transition-transform duration-200 flex-shrink-0',
                      isActive(item.path) ? 'text-emerald-400 scale-110' : '',
                      collapsed && !isMobile && isActive(item.path) ? 'scale-125' : ''
                    )}
                  >
                    {item.icon}
                  </span>
                  <div
                    className={cn(
                      'transition-all duration-300 overflow-hidden',
                      collapsed && !isMobile ? 'w-0 opacity-0' : 'w-auto opacity-100'
                    )}
                  >
                    <span className='font-medium whitespace-nowrap'>{item.label}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className='mt-auto p-4 border-t border-slate-700/50 overflow-hidden'>
          <div
            className={cn(
              'transition-all duration-300 ease-in-out overflow-hidden',
              collapsed && !isMobile ? 'opacity-0 h-0 p-0' : 'opacity-100 h-auto'
            )}
          >
            <div className='bg-slate-700/30 rounded-md p-3'>
              <p className='text-xs text-slate-400 mb-1'>Current Version</p>
              <p className='text-sm font-medium text-emerald-400'>PrayerBox v2.0</p>
            </div>
          </div>
          {collapsed && !isMobile && (
            <div className='flex justify-center transition-all duration-300'>
              <span className='text-emerald-400 text-xs'>v2.0</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
