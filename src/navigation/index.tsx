import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import Home from "@/pages/home";
import Register from "@/pages/auth/register";
import Login from "@/pages/auth/login";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import LoadingPage from "@/components/LoadingPage";

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
      setIsAuthenticated(!!session);
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
        <Route element={isAuthenticated ? <Navigate to={"/"} /> : <Outlet />}>
          <Route path={"/auth"} element={<Login />} />
          <Route path={"/register"} element={<Register />} />
        </Route>
        <Route element={isAuthenticated ? <Outlet /> : <Navigate to={"/auth"} />}>
          <Route path={"/"} element={<Home />} />
        </Route>
        <Route path={"*"} element={<Navigate to={"/"} />} />
      </Routes>
    </BrowserRouter>
  );
}
