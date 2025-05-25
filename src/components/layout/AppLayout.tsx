import { useState, useEffect } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMobileSidebar) {
        setShowMobileSidebar(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showMobileSidebar]);

  useEffect(() => {
    if (showMobileSidebar) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [showMobileSidebar]);

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className='flex h-screen'>
      {/* Desktop sidebar */}
      <div className='hidden md:block'>
        <Sidebar />
      </div>

      {/* Mobile sidebar with overlay */}
      <div
        className={`md:hidden fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          showMobileSidebar ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMobileSidebar}
      />

      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 max-w-[280px] w-[80%] transform transition-transform duration-300 ease-in-out ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <Sidebar onClose={toggleMobileSidebar} isMobile={true} />
      </div>

      <div className='flex flex-col flex-1 overflow-hidden'>
        <Header onMenuClick={toggleMobileSidebar} />

        <main className='flex-1 overflow-y-auto p-4 bg-slate-50'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
