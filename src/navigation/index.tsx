import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router';
import { useEffect, useState, Suspense } from 'react';
import { getCurrentSession, subscribeToAuthChanges } from '@/lib/supabase';
import { AppRoutes, AuthRoutes } from '@/constants';
import { AppLayout } from '@/components/layout';
import {
  Announcements,
  AyatAndHadith,
  Events,
  ForgotPassword,
  Home,
  Loading,
  Login,
  Posts,
  Profile,
  Register,
  ResetPassword,
  Settings,
  SettingsModules,
  SettingsThemes,
  SettingsHijri,
  UpdatePassword,
  PrayerTimings,
  Display,
  LoginWithCode,
} from '@/pages';
import { useDisplayStore } from '@/store';

export default function Navigation() {
  const [isLoggedInWithEmail, setIsLoggedInWithEmail] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { loggedIn: isLoggedInWithCode } = useDisplayStore();

  const isLoggedIn = isLoggedInWithCode || isLoggedInWithEmail || false;
  const route = isLoggedInWithCode ? AppRoutes.Display : AppRoutes.Home;

  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await getCurrentSession();
        setIsLoggedInWithEmail(!!session);
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
      setIsLoggedInWithEmail(!!session?.user);
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
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Auth routes - only accessible when logged out */}
          <Route element={isLoggedIn ? <Navigate to={route} /> : <Outlet />}>
            <Route path={AuthRoutes.Login} element={<Login />} />
            <Route path={AuthRoutes.LoginWithCode} element={<LoginWithCode />} />
            <Route path={AuthRoutes.Register} element={<Register />} />
            <Route path={AuthRoutes.ForgotPassword} element={<ForgotPassword />} />
          </Route>

          {/* Admin routes with layout - require authentication */}
          <Route element={isLoggedInWithEmail ? <AppLayout /> : <Navigate to={AuthRoutes.Login} />}>
            <Route path={AppRoutes.Home} element={<Home />} />
            <Route path={AppRoutes.Profile} element={<Profile />} />
            <Route path={AppRoutes.ResetPassword} element={<ResetPassword />} />
            <Route path={AppRoutes.UpdatePassword} element={<UpdatePassword />} />
            <Route path={AppRoutes.AyatAndHadith} element={<AyatAndHadith />} />
            <Route path={AppRoutes.Announcements} element={<Announcements />} />
            <Route path={AppRoutes.Events} element={<Events />} />
            <Route path={AppRoutes.Posts} element={<Posts />} />
            <Route path={AppRoutes.PrayerTimings} element={<PrayerTimings />} />
            <Route path={AppRoutes.Settings} element={<Settings />} />
            <Route path={AppRoutes.SettingsModules} element={<SettingsModules />} />
            <Route path={AppRoutes.SettingsThemes} element={<SettingsThemes />} />
            <Route path={AppRoutes.SettingsHijri} element={<SettingsHijri />} />
          </Route>

          {/* Display routes - require authentication */}
          <Route
            element={isLoggedInWithCode ? <Outlet /> : <Navigate to={AuthRoutes.LoginWithCode} />}
          >
            <Route path={AppRoutes.Display} element={<Display />} />
          </Route>

          <Route path={'*'} element={<Navigate to={route} />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
