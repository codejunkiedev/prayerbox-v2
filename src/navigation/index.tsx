import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import Home from "@/pages/home";
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import LoadingPage from "@/components/LoadingPage";
import { AppRoutes, AuthRoutes } from "@/constants";

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthenticated(!!data.session);
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={isAuthenticated ? <Navigate to={AppRoutes.Home} /> : <Outlet />}>
          <Route path={AuthRoutes.Login} element={<Login />} />
          <Route path={AuthRoutes.Register} element={<Register />} />
          <Route path={AuthRoutes.ForgotPassword} element={<ForgotPassword />} />
          <Route path={AuthRoutes.ResetPassword} element={<ResetPassword />} />
        </Route>
        <Route element={isAuthenticated ? <Outlet /> : <Navigate to={AuthRoutes.Login} />}>
          <Route path={AppRoutes.Home} element={<Home />} />
        </Route>
        <Route path={"*"} element={<Navigate to={AppRoutes.Home} />} />
      </Routes>
    </BrowserRouter>
  );
}
