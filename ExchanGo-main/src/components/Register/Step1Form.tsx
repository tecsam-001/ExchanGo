"use client";
import React, { useState } from "react";
import Link from "next/link";
import CustomInput from "../ui/CustomInput";
import Image from "next/image";
import GradientButton from "../ui/GradientButton";
import { registerUser } from "@/services/api";
import { toast } from "react-toastify";

interface FormData {
  email: string;
  password: string;
}

interface Step1FormProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: () => void;
  handleSignIn: () => void;
}

const Step1Form: React.FC<Step1FormProps> = ({
  formData,
  handleInputChange,
  handleNext,
  handleSignIn,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isRegistering, setIsRegistering] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!isChecked) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsRegistering(true);

    try {
      // Register the user
      const response = await registerUser({
        email: formData.email,
        password: formData.password,
        isTermsAccepted: isChecked,
        remember: true, // Always remember for registration flow
      });

      if (!response.success) {
        if (response.statusCode === 422) {
          // Handle validation errors
          toast.error("This email is already registered.");
          setErrors({ ...errors, email: "This email is already registered" });
        } else {
          // Handle other errors
          toast.error(
            response.message || "Registration failed. Please try again."
          );
        }
        setIsRegistering(false);
        return;
      }

      console.log(
        "Step1Form - Registration successful, proceeding to next step"
      );

      // Proceed to next step with the updated form data
      handleNext();
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  return (
    <div className="w-full text-center max-w-[398px] mx-auto">
      <h3 className="text-[#111111] font-bold text-[24px] md:text-[32px] leading-[29px] md:leading-[38px] mb-2.5">
        Create your account
      </h3>
      <p className="text-[#585858] text-[14px] md:text-base leading-[20px] md:leading-[22px] mb-6">
        Start managing your exchange office with ExchanGo
      </p>

      <div className="mt-[28px]">
        <CustomInput
          type="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        {errors.email && (
          <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
            {errors.email}
          </div>
        )}
      </div>

      <div className="mt-6">
        <CustomInput
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        {errors.password && (
          <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
            {errors.password}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center">
        <input
          type="checkbox"
          id="terms"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className="mr-2 w-4 h-4 accent-[#20523C]"
        />
        <label
          htmlFor="terms"
          className="text-[#585858] text-[14px] leading-[20px] font-normal text-left"
        >
          I agree to the{" "}
          <a
            href="/terms-and-conditions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#20523C] cursor-pointer hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/mentions-legales"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#20523C] cursor-pointer hover:underline"
          >
            Legal Notice
          </a>
        </label>
      </div>
      {errors.terms && (
        <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
          {errors.terms}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mt-6">
        <GradientButton
          className="w-full"
          onClick={handleSubmit}
          disabled={isRegistering}
        >
          {isRegistering ? "Creating Account..." : "Create Account"}
        </GradientButton>

        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-[#20523C] border border-[#20523C] rounded-md py-2 px-4 hover:bg-[#f0f7f4] transition-colors"
        >
          Skip
        </button>
      </div>

      <div className="mt-6 text-[#585858] text-[14px] leading-[20px] font-normal">
        Already have an account?{" "}
        <span className="text-[#20523C] cursor-pointer" onClick={handleSignIn}>
          Sign In
        </span>
      </div>
    </div>
  );
};

export default Step1Form;
