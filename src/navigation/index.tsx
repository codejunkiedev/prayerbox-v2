import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import Home from "@/pages/home";
import Auth from "@/pages/auth";

export default function Navigation() {
  const isAuthenticated = false;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={isAuthenticated ? <Navigate to={"/"} /> : <Outlet />}>
          <Route path={"/auth"} element={<Auth />} />
        </Route>
        <Route element={isAuthenticated ? <Outlet /> : <Navigate to={"/auth"} />}>
          <Route path={"/"} element={<Home />} />
        </Route>
        <Route path={"*"} element={<Navigate to={"/"} />} />
      </Routes>
    </BrowserRouter>
  );
}
