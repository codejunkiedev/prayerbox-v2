import { Menu, Bell, User, Settings, LogOut } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { Link } from 'react-router';
import { AppRoutes } from '@/constants';
import { useState } from 'react';
import { SignOutModal } from '@/components/modals';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const openSignOutDialog = () => {
    setShowSignOutDialog(true);
  };

  const closeSignOutDialog = () => {
    setShowSignOutDialog(false);
  };

  return (
    <header className='bg-white shadow h-16 flex items-center px-4'>
      <Button variant='ghost' size='icon' className='md:hidden mr-2' onClick={onMenuClick}>
        <Menu size={20} />
      </Button>

      <h1 className='text-xl font-semibold md:ml-1'>PrayerBox</h1>

      <div className='ml-auto flex items-center space-x-2'>
        <Button variant='ghost' size='icon' className='text-slate-600'>
          <Bell size={20} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='text-slate-600'>
              <User size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <Link to={AppRoutes.Profile}>
              <DropdownMenuItem>
                <User className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link to={AppRoutes.UpdatePassword}>
              <DropdownMenuItem>
                <Settings className='mr-2 h-4 w-4' />
                <span>Update Password</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={openSignOutDialog}>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SignOutModal isOpen={showSignOutDialog} onClose={closeSignOutDialog} />
    </header>
  );
}
