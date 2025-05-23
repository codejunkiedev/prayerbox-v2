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

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  return (
    <div className='flex h-screen'>
      <div className='hidden md:block'>
        <Sidebar />
      </div>

      {showMobileSidebar && (
        <div
          className='md:hidden fixed inset-0 z-50 bg-black bg-opacity-50'
          onClick={toggleMobileSidebar}
        >
          <div className='h-full' onClick={e => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

      <div className='flex flex-col flex-1 overflow-hidden'>
        <Header onMenuClick={toggleMobileSidebar} />

        <main className='flex-1 overflow-y-auto p-4 bg-slate-50'>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
