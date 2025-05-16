import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { useEffect, useState } from 'react';
import { getCurrentSession, subscribeToAuthChanges } from '@/lib/supabase';
import { AppRoutes, AuthRoutes } from '@/constants';
import { AppLayout } from '@/components/layout';
import { ForgotPassword, Home, Loading, Login, Profile, Register, ResetPassword } from '@/pages';

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await getCurrentSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = subscribeToAuthChanges(session => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes - only accessible when logged out */}
        <Route element={isAuthenticated ? <Navigate to={AppRoutes.Home} /> : <Outlet />}>
          <Route path={AuthRoutes.Login} element={<Login />} />
          <Route path={AuthRoutes.Register} element={<Register />} />
          <Route path={AuthRoutes.ForgotPassword} element={<ForgotPassword />} />
        </Route>

        {/* App routes with layout - require authentication */}
        <Route element={isAuthenticated ? <AppLayout /> : <Navigate to={AuthRoutes.Login} />}>
          <Route path={AppRoutes.Home} element={<Home />} />
          <Route path={AppRoutes.Profile} element={<Profile />} />
          <Route path={AppRoutes.ResetPassword} element={<ResetPassword />} />
        </Route>

        <Route path={'*'} element={<Navigate to={AppRoutes.Home} />} />
      </Routes>
    </BrowserRouter>
  );
}
