import { Navigate } from "react-router";
import { isAuthenticated, isStaffUser } from "../hooks/auth";
import SignIn from "../pages/AuthPages/SignIn";

export default function RootRedirect() {
  const loggedIn = isAuthenticated();

  if (loggedIn) {
    const isStaff = isStaffUser();
    return <Navigate to={isStaff ? "/events" : "/dashboard"} replace />;
  }

  return <SignIn />;
}

