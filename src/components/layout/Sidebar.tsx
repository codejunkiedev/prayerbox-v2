import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  BookOpen,
  Bell,
  Calendar,
  File,
  Clock,
  X,
} from 'lucide-react';
import { AppRoutes } from '@/constants';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onClose, isMobile = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

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
      icon: <Calendar size={20} />,
    },
    {
      label: 'Posts',
      path: AppRoutes.Posts,
      icon: <File size={20} />,
    },
    {
      label: 'Prayer Timings',
      path: AppRoutes.PrayerTimings,
      icon: <Clock size={20} />,
    },
  ];

  return (
    <aside
      className={cn(
        'h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out relative flex flex-col',
        collapsed && !isMobile ? 'w-16' : 'w-64'
      )}
    >
      <div className='p-4 flex items-center justify-between border-b border-slate-700/50'>
        {(!collapsed || isMobile) && (
          <div className='flex items-center'>
            <div className='w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center mr-3'>
              <span className='font-bold text-white'>P</span>
            </div>
            <h1 className='text-xl font-semibold'>PrayerBox</h1>
          </div>
        )}

        {isMobile ? (
          <Button
            variant='ghost'
            size='icon'
            className='text-white hover:bg-slate-700/50 ml-auto'
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='icon'
            className={cn('text-white hover:bg-slate-700/50', collapsed ? 'mx-auto' : 'ml-auto')}
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        )}
      </div>

      <nav className='flex-1 overflow-y-auto py-4'>
        <ul className='space-y-1 px-3'>
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  'flex items-center rounded-md px-3 py-2.5 transition-all',
                  isActive(item.path)
                    ? 'bg-slate-700/70 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-700/40 hover:text-white',
                  collapsed && !isMobile ? 'justify-center' : 'space-x-3'
                )}
                onClick={isMobile ? onClose : undefined}
              >
                <span className={cn(isActive(item.path) ? 'text-emerald-400' : '')}>
                  {item.icon}
                </span>
                {(!collapsed || isMobile) && <span className='font-medium'>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className='mt-auto p-4 border-t border-slate-700/50'>
        {!collapsed || isMobile ? (
          <div className='bg-slate-700/30 rounded-md p-3'>
            <p className='text-xs text-slate-400 mb-1'>Current Version</p>
            <p className='text-sm font-medium text-emerald-400'>PrayerBox v2.0</p>
          </div>
        ) : (
          <div className='flex justify-center'>
            <span className='text-emerald-400 text-xs'>v2.0</span>
          </div>
        )}
      </div>
    </aside>
  );
}
