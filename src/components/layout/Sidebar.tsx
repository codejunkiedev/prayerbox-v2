import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { ChevronLeft, ChevronRight, Home, User, LogOut } from 'lucide-react';
import { AppRoutes } from '@/constants';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { SignOutModal } from '@/components/modals';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const openSignOutDialog = () => {
    setShowSignOutDialog(true);
  };

  const closeSignOutDialog = () => {
    setShowSignOutDialog(false);
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
      label: 'Profile',
      path: AppRoutes.Profile,
      icon: <User size={20} />,
    },
  ];

  return (
    <>
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

        <div className='p-4 border-t border-slate-700'>
          <Button
            variant='ghost'
            className={cn(
              'w-full text-white hover:bg-slate-700 flex items-center',
              collapsed ? 'justify-center' : 'justify-start space-x-3'
            )}
            onClick={openSignOutDialog}
          >
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      <SignOutModal isOpen={showSignOutDialog} onClose={closeSignOutDialog} />
    </>
  );
}
