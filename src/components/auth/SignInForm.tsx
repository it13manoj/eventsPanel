import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { loginUser } from "../../hooks/api/authService";



export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [is_enabled, setEnabled] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [searchParams] = useSearchParams();
  const isSessionExpired = searchParams.get("expired") === "1";
  const navigation = useNavigate();
  const [login, setLogin] = useState({
    email: "",
    password: ""
  });

  const eventHendler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogin(preState => ({ ...preState, [e.target.name]: e.target.value }))
  }

  const loginHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginUser(login);

      if (res?.results?.token) {
        localStorage.setItem("token", res.results.token);
        if (res.results.user) {
          localStorage.setItem("user", JSON.stringify(res.results.user));
          const role = res.results.user.role || (res.results.user.role_id === 2 ? "ADMIN" : "STAFF");
          localStorage.setItem("role", role);
          if (res.results.user.permissions) {
            const permStr = typeof res.results.user.permissions === "string" 
              ? res.results.user.permissions 
              : JSON.stringify(res.results.user.permissions);
            localStorage.setItem("permissions", permStr);
          }

          if (role === "STAFF" || role === "USERS") {
            navigation("/events");
          } else {
            navigation("/dashboard");
          }
          return;
        }
        navigation("/dashboard");
      } else {
        alert("Invalid Credentials");
      }

    } catch (err) {
      alert("Invalid Credentials");
    }

  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F4") {
        setEnabled(true);
      } else {
        setEnabled(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);



  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">

      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          {isSessionExpired && (
            <div className="flex items-center gap-2.5 p-3.5 mb-5 text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300">
              <svg className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Your session has expired. Please log in again to continue.</span>
            </div>
          )}

          <div>

            <form onSubmit={loginHandler}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input placeholder="info@gmail.com" name="email" onChange={eventHendler} />
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      name="password"
                      onChange={eventHendler}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={isChecked} onChange={setIsChecked} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      Keep me logged in
                    </span>
                  </div>
                  <Link
                    to="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div>
                  <Button className="w-full" size="sm">
                    Sign in
                  </Button>
                </div>
              </div>
            </form>
            {is_enabled == true &&
              <div className="mt-5">
                <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                  Don&apos;t have an account? {""}
                  <Link
                    to="/signup"
                    className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            }


          </div>
        </div>
      </div>
    </div>
  );
}
