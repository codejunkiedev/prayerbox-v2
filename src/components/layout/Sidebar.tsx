import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronLeft, ChevronRight, Home, BookOpen } from 'lucide-react';
import { AppRoutes } from '@/constants';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function Sidebar() {
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
  ];

  return (
    <aside
      className={cn(
        'h-screen bg-slate-800 text-white transition-all duration-300 ease-in-out relative flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className='p-4 flex items-center justify-between border-b border-slate-700'>
        {!collapsed && <h1 className='text-xl font-semibold'>PrayerBox</h1>}
        <Button
          variant='ghost'
          size='icon'
          className={cn('text-white hover:bg-slate-700 ml-auto', collapsed && 'mx-auto')}
          onClick={toggleSidebar}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <nav className='flex-1 overflow-y-auto py-4'>
        <ul className='space-y-2 px-2'>
          {navItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  'flex items-center rounded-md px-3 py-2 hover:bg-slate-700 transition-colors',
                  isActive(item.path) && 'bg-slate-700',
                  collapsed ? 'justify-center' : 'space-x-3'
                )}
              >
                <span>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
