import { Menu, LogOut, UserRound, RectangleEllipsis } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface HeaderProps {
  onMenuClick: () => void;
  isScrolled?: boolean;
}

export default function Header({ onMenuClick, isScrolled = false }: HeaderProps) {
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const openSignOutDialog = () => {
    setShowSignOutDialog(true);
  };

  const closeSignOutDialog = () => {
    setShowSignOutDialog(false);
  };

  return (
    <header
      className={cn(
        'bg-white h-16 flex items-center px-4 sticky top-0 z-30 transition-all duration-200',
        isScrolled ? 'shadow-md' : 'shadow-sm'
      )}
    >
      <Button variant='ghost' size='icon' className='md:hidden mr-2' onClick={onMenuClick}>
        <Menu size={20} />
      </Button>

      <h1 className='text-xl font-semibold md:ml-1 text-slate-800'>PrayerBox</h1>

      <div className='ml-auto flex items-center space-x-2'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='text-slate-600 hover:bg-slate-100 rounded-full'
            >
              <UserRound size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-56'>
            <Link to={AppRoutes.Profile}>
              <DropdownMenuItem className='cursor-pointer'>
                <UserRound className='mr-2 h-4 w-4' />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <Link to={AppRoutes.UpdatePassword}>
              <DropdownMenuItem className='cursor-pointer'>
                <RectangleEllipsis className='mr-2 h-4 w-4' />
                <span>Update Password</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={openSignOutDialog}
              className='cursor-pointer text-red-600 focus:text-red-600'
            >
              <LogOut className='mr-2 h-4 w-4 text-red-600 hover:text-red-600' />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SignOutModal isOpen={showSignOutDialog} onClose={closeSignOutDialog} />
    </header>
  );
}
