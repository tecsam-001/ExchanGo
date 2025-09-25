import React from "react";
import Header from "../Header";
import Step1Form from "./Step1Form";
import Step2Form from "./Step2Form";
import Step3Form from "./Step3Form";

export interface FormData {
  email: string;
  password: string;
  officeName: string;
  registrationNumber: string;
  licenseNumber: string;
  streetAddress: string;
  city: string;
  cityId: string;
  cityName: string;
  province: string;
  phoneNumber: string;
  whatsappNumber: string;
  otherNumber?: string;
  isWhatsAppSame?: boolean;
  logo?: string | { id: string; file?: any };
  logoPreviewUrl?: string;
}

interface RegisterProps {
  step: number;
  maxStep: number;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: (stepData?: any) => void;
  handleSignIn: () => void;
  handleStepChange: (step: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  children?: React.ReactNode;
}

const Register: React.FC<RegisterProps> = ({
  step,
  maxStep,
  formData,
  handleInputChange,
  handleNext,
  handleSignIn,
  handleStepChange,
  setFormData,
}) => {
  return (
    <div className="flex flex-col">
      <Header
        step={step}
        maxStep={maxStep}
        handleSignIn={handleSignIn}
        handleStepChange={handleStepChange}
      />
      <div className="my-8 sm:my-10 md:my-[80px] flex-grow flex items-center flex-col justify-center px-5">
        {step === 1 && (
          <Step1Form
            formData={formData}
            handleInputChange={handleInputChange}
            handleNext={() => handleNext(formData)}
            handleSignIn={handleSignIn}
          />
        )}
        {step === 2 && (
          <Step2Form
            formData={formData}
            handleInputChange={handleInputChange}
            handleNext={(stepData) => handleNext(stepData)}
            handleStepChange={handleStepChange}
            setFormData={setFormData}
          />
        )}
        {step === 3 && (
          <Step3Form
            formData={formData}
            handleInputChange={handleInputChange}
            handleNext={(stepData) => handleNext(stepData)}
            handleStepChange={handleStepChange}
          />
        )}
      </div>
    </div>
  );
};

export default Register;
