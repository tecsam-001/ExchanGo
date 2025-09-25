"use client";
import LoginHeader from "@/components/AdminComponents/LoginHeader";
import AnimatedInput from "@/components/ui/AnimatedInput";
import Checkbox from "@/components/ui/Checkbox";
import CustomInput, { EmailIcon, LockIcon } from "@/components/ui/CustomInput";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser, googleLogin } from "@/services/api";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import "@/styles/google-button.css";

const AdminLogin: React.FC = () => {
  const [isRememberMe, setIsRememberMe] = useState<boolean>(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<
    "login" | "gmail" | "facebook" | null
  >(null);
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = (password: string) => password.length >= 8;

  const canSignIn = isValidEmail(email) && isValidPassword(password);

  // Check if user is already logged in and redirect based on role
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     // Get user data from storage to check role
  //     const userData =
  //       localStorage.getItem("user") || sessionStorage.getItem("user");
  //     if (userData) {
  //       const user = JSON.parse(userData);
  //       if (user.id === 1) {
  //         router.push("/admin/dashboard");
  //       } else {
  //         router.push("/setting");
  //       }
  //     } else {
  //       // Fallback if no user data found
  //       router.push("/setting");
  //     }
  //   }
  // }, [isAuthenticated, router]);

  const handleCheckboxChange = (checked: boolean) => {
    setIsRememberMe(checked);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSignIn) {
      return;
    }

    try {
      setIsLoading("login");

      const credentials = {
        email,
        password,
        remember: isRememberMe,
      };

      const response = await loginUser(credentials);

      if (!response.success) {
        if (response.statusCode === 401) {
          toast.error("Invalid email or password. Please try again.");
        } else if (response.statusCode === 403) {
          toast.error("Your account is not active. Please contact support.");
        } else {
          toast.error(response.message || "Login failed. Please try again.");
        }
        return;
      }

      // Check user role and redirect accordingly
      const { user } = response.data;

      // Update auth context
      login(response.data);

      toast.success("Login successful!");

      // Redirect based on user role ID
      if (user.id === 1) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading("gmail");

      const response = await googleLogin(credentialResponse.credential);

      if (!response.success) {
        if (response.statusCode === 401) {
          toast.error("Invalid Google credentials. Please try again.");
        } else if (response.statusCode === 403) {
          toast.error("Your account is not active. Please contact support.");
        } else {
          toast.error(
            response.message || "Google login failed. Please try again."
          );
        }
        return;
      }

      // Check user role and redirect accordingly
      const { user } = response.data;

      // Update auth context
      login(response.data);

      toast.success("Google login successful!");

      // Redirect based on user role ID
      if (user.id === 1) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login failed. Please try again.");
    setIsLoading(null);
  };

  const handleSignInExternal = (provider: "gmail" | "facebook") => {
    if (provider === "facebook") {
      setIsLoading(provider);
      toast.info(`${provider} login is not implemented yet.`);
      setTimeout(() => {
        setIsLoading(null);
      }, 1000);
    }
    // For Gmail, we use GoogleLogin component directly
  };

  return (
    <div className="min-h-screen relative px-5 md:px-8">
      <div className="max-w-[1440px] w-full mx-auto relative z-30 mb-10 md:mb-20">
        <LoginHeader />

        <div className="mt-[60px] md:mt-[19px] max-w-[398px] mx-auto w-full text-center pb-20">
          <div className="mb-6 flex items-center justify-center">
            <Image
              src="/assets/admin-logo.svg"
              alt="logo"
              width={100}
              height={100}
              className="md:w-[100px] w-[80px]"
            />
          </div>

          <h1 className="text-[#111111] text-[32px] leading-[29px] sm:leading-[38px] font-bold mb-2.5">
            Welcome back
          </h1>
          <p className="text-[#585858] text-[14px] sm:text-[16px]  leading-[22px] font-normal">
            Enter Email & Password to continue
          </p>

          <form onSubmit={handleSignIn}>
            <div className="sm:mb-6 my-4 sm:mt-8">
              <AnimatedInput
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => setEmailTouched(true)}
                placeholder="Enter your email"
                icon={<EmailIcon />}
                validation={isValidEmail}
                error={
                  emailTouched && email.length > 0 && !isValidEmail(email)
                    ? "Please enter a valid email address."
                    : undefined
                }
                required
              />
            </div>

            <div>
              <AnimatedInput
                label="Password"
                type="password"
                value={password}
                onChange={setPassword}
                onBlur={() => setPasswordTouched(true)}
                icon={<LockIcon />}
                validation={isValidPassword}
                error={
                  passwordTouched &&
                  password.length > 0 &&
                  !isValidPassword(password)
                    ? "Password must be at least 8 characters long"
                    : undefined
                }
                showPasswordToggle={true}
                required
              />
            </div>

            <div className="mt-2.5 sm:mt-4 flex items-center justify-between">
              <div className="flex items-start gap-2.5">
                <Checkbox
                  checked={isRememberMe}
                  onChange={handleCheckboxChange}
                />
                <h3 className="text-[#585858] text-[14px] leading-[20px] font-normal text-left">
                  Remember me
                </h3>
              </div>
              <Link
                href="/admin/forgot-password"
                className="text-[#20523C] text-[14px] leading-[20px] font-semibold cursor-pointer"
              >
                Forgot Password
              </Link>
            </div>

            <button
              type="submit"
              disabled={!canSignIn || isLoading !== null}
              className={`mt-8 w-full h-[46px] rounded-md relative flex items-center justify-center cursor-pointer text-[#20523C] text-base font-semibold leading-[22px] transition-opacity duration-200 ${
                !canSignIn || isLoading !== null
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={{
                background:
                  "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                boxShadow:
                  "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
              }}
            >
              {isLoading === "login" ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="w-full h-[0.5px] bg-[#DEDEDE]"></div>
            <h3 className="text-[#585858] text-[14px] leading-[20px] font-normal">
              or
            </h3>
            <div className="w-full h-[0.5px] bg-[#DEDEDE]"></div>
          </div>

          <div className="w-full">
            {isLoading === "gmail" ? (
              <div className="mb-2 cursor-pointer border border-[#DEDEDE] rounded-lg h-[50px] w-full flex items-center justify-center gap-2 text-[#111111] text-[16px] leading-[22px] font-normal disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="mb-2 google-login-button">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                  locale="en"
                  // Removed width and containerProps className to avoid built-in styling
                />
              </div>
            )}
            <button
              onClick={() => handleSignInExternal("facebook")}
              disabled={isLoading !== null}
              className="border cursor-pointer border-[#DEDEDE] rounded-lg h-[50px] w-full flex items-center justify-center gap-2 text-[#111111] text-[16px] leading-[22px] font-normal disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading === "facebook" ? (
                <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Image
                    src="/assets/facebook.svg"
                    alt="facebook"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  Sign in with Facebook
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="fixed -bottom-10 left-0 w-full z-0 pointer-events-none">
        <img
          src="/assets/admin-login.svg"
          alt="admin"
          className="w-full h-auto object-cover md:block hidden"
        />
        <img
          src="/assets/mobile.svg"
          alt="admin"
          className="w-full h-auto object-cover md:hidden block"
        />
      </div>
    </div>
  );
};

export default AdminLogin;
