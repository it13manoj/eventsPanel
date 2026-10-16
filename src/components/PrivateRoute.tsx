import { Navigate, Outlet } from "react-router";
import { isAuthenticated, isTokenExpired } from "../hooks/auth";

const PrivateRoute = () => {
  const token = localStorage.getItem("token");
  const hadToken = !!token;
  const isExpired = hadToken && isTokenExpired(token);
  const loggedIn = isAuthenticated();

  if (!loggedIn) {
    const search = isExpired ? "?expired=1" : "";
    return <Navigate to={`/login${search}`} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;