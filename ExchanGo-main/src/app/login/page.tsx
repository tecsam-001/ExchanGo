"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Register from "@/components/Register/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Step1Form from "@/components/Register/Step1Form";
import { FormData } from "@/components/Register/Register"; // Correct import

const Login: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    officeName: "",
    registrationNumber: "",
    licenseNumber: "",
    streetAddress: "",
    city: "",
    cityId: "", // Add this line
    cityName: "", // Add this line
    province: "",
    phoneNumber: "",
    whatsappNumber: "",
    otherNumber: "",
    isWhatsAppSame: false,
    logo: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = (stepData?: any) => {
    if (stepData) {
      console.log("Login page - Received form data from step:", step, stepData);

      // Merge the new data with existing form data
      const updatedFormData = {
        ...formData,
        ...stepData,
      };

      console.log("Login page - Updated form data:", updatedFormData);
      setFormData(updatedFormData);
    }

    if (step === 1) {
      setStep(2);
      setMaxStep((prev) => Math.max(prev, 2));
    } else if (step === 2) {
      console.log(
        "Login page - Moving from Step2 to Step3 with form data:",
        formData
      );
      setStep(3);
      setMaxStep((prev) => Math.max(prev, 3));
    }
  };

  const handleSignIn = () => {
    router.push("/admin");
  };

  const handleStepChange = (newStep: number) => {
    if (newStep <= maxStep) {
      setStep(newStep);
    }
  };

  return (
    <>
      <Register
        step={step}
        maxStep={maxStep}
        formData={formData}
        handleInputChange={handleInputChange}
        handleNext={handleNext}
        handleSignIn={handleSignIn}
        handleStepChange={handleStepChange}
        setFormData={setFormData}
      />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default Login;
