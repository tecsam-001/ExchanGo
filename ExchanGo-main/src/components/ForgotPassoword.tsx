"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EmailIcon } from "./ui/CustomInput";
import BackToLoginButton from "./ui/BackToLoginButton";
import AnimatedInput from "./ui/AnimatedInput";
import LoginHeader from "./AdminComponents/LoginHeader";
import { forgotPassword } from "@/services/api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const emailIsValid = isValidEmail(email);

  const handleForgotPassword = async () => {
    if (!emailIsValid) return;

    try {
      setIsLoading(true);
      const response = await forgotPassword(email);

      if (response.success) {
        setSubmitted(true);
        toast.success("Password reset link sent successfully!");
      } else {
        toast.error(response.message || "Failed to send reset email");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setIsLoading(true);
      const response = await forgotPassword(email);

      if (response.success) {
        toast.success("Password reset link sent again!");
      } else {
        toast.error(response.message || "Failed to resend email");
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen relative px-5 md:px-8">
        <div className="max-w-[1440px] w-full mx-auto relative z-10 mb-10 md:mb-20 flex items-center justify-center flex-col h-full">
          <LoginHeader />

          {!submitted ? (
            <div className="mt-24 max-w-[398px] mx-auto w-full text-center">
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
                Forgot Password ?
              </h1>
              <p className="text-[#585858] text-[14px] sm:text-[16px] leading-[22px] font-normal">
                No worries, We'll send you reset instruction
              </p>

              <div className="mt-8">
                <AnimatedInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Place holder"
                  icon={<EmailIcon />}
                  validation={isValidEmail}
                  error="Please enter a valid email address."
                  required
                />
              </div>

              <button
                disabled={!email.trim() || !emailIsValid || isLoading}
                className={`mb-6 mt-8 w-full h-[46px] rounded-md relative text-[#20523C] text-base font-semibold leading-[22px] transition-opacity duration-200 flex items-center justify-center ${
                  !email.trim() || !emailIsValid || isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                style={{
                  background:
                    "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  boxShadow:
                    "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
                }}
                onClick={handleForgotPassword}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
              <BackToLoginButton />
            </div>
          ) : (
            <div className="mt-24 max-w-[398px] mx-auto w-full text-center">
              <div className="flex items-center justify-center mb-6">
                <Image
                  src="/assets/check-your-email.svg"
                  alt="email"
                  width={100}
                  height={100}
                  className="md:w-[100px] w-[80px]"
                />
              </div>
              <h2 className="text-[#111111] text-[32px] leading-[29px] sm:leading-[38px] font-bold mb-2.5">
                Check your email
              </h2>
              <p className="text-[#585858] text-[14px] sm:text-[16px] leading-[22px] font-normal">
                We sent a password reset link to <br />{" "}
                <span className="font-medium">{email}</span>
              </p>

              <button
                onClick={() => window.open("mailto:" + email)}
                className="mt-6 w-full h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-base font-semibold leading-[22px]"
                style={{
                  background:
                    "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  boxShadow:
                    "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
                }}
              >
                Open Email App
              </button>

              <div className="my-6 text-[14px] leading-[20px] font-normal text-[#585858]">
                Didn't receive the email ?
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className={`text-[#20523C] font-semibold ml-1.5 ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {isLoading ? "Sending..." : "Click to resend"}
                </button>
              </div>

              <BackToLoginButton />
            </div>
          )}
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
    </>
  );
};

export default ForgotPassword;
