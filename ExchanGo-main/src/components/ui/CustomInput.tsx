import React, { useState } from 'react';

const EmailIcon: React.FC = () => (
     <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.1641 17.0833H5.83073C3.33073 17.0833 1.66406 15.8333 1.66406 12.9166V7.08329C1.66406 4.16663 3.33073 2.91663 5.83073 2.91663H14.1641C16.6641 2.91663 18.3307 4.16663 18.3307 7.08329V12.9166C18.3307 15.8333 16.6641 17.0833 14.1641 17.0833Z" stroke="#292D32" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.1693 7.5L11.5609 9.58333C10.7026 10.2667 9.29427 10.2667 8.43593 9.58333L5.83594 7.5" stroke="#292D32" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
     </svg>
);

const LockIcon: React.FC = () => (
     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.34406 13H4.9974C4.58406 13 4.2174 12.9867 3.89073 12.94C2.1374 12.7467 1.66406 11.92 1.66406 9.66667V6.33333C1.66406 4.08 2.1374 3.25333 3.89073 3.06C4.2174 3.01333 4.58406 3 4.9974 3H7.30406" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10.0156 3H11.0023C11.4156 3 11.7823 3.01333 12.109 3.06C13.8623 3.25333 14.3356 4.08 14.3356 6.33333V9.66667C14.3356 11.92 13.8623 12.7467 12.109 12.94C11.7823 12.9867 11.4156 13 11.0023 13H10.0156" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 1.33337V14.6667" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.39998 7.99996H7.40597" stroke="#292D32" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.72811 7.99996H4.7341" stroke="#292D32" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
     </svg>
);

interface EyeIconProps {
     isVisible: boolean;
}

const EyeIcon: React.FC<EyeIconProps> = ({ isVisible }) => (
     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className='cursor-pointer' xmlns="http://www.w3.org/2000/svg">
          <path d="M10.3905 8.00007C10.3905 9.32007 9.32385 10.3867 8.00385 10.3867C6.68385 10.3867 5.61719 9.32007 5.61719 8.00007C5.61719 6.68007 6.68385 5.6134 8.00385 5.6134C9.32385 5.6134 10.3905 6.68007 10.3905 8.00007Z" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.9999 13.5133C10.3532 13.5133 12.5466 12.1266 14.0732 9.72665C14.6732 8.78665 14.6732 7.20665 14.0732 6.26665C12.5466 3.86665 10.3532 2.47998 7.9999 2.47998C5.64656 2.47998 3.45323 3.86665 1.92656 6.26665C1.32656 7.20665 1.32656 8.78665 1.92656 9.72665C3.45323 12.1266 5.64656 13.5133 7.9999 13.5133Z" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" />
          {!isVisible && (
               <line x1="2" y1="2" x2="14" y2="14" stroke="#292D32" strokeLinecap="round" />
          )}
     </svg>
);

const UserIcon: React.FC = () => (
     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.00065 8.00004C9.84165 8.00004 11.334 6.50766 11.334 4.66671C11.334 2.82575 9.84165 1.33337 8.00065 1.33337C6.15969 1.33337 4.66732 2.82575 4.66732 4.66671C4.66732 6.50766 6.15969 8.00004 8.00065 8.00004Z" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.7269 14.6667C13.7269 12.0867 11.1603 10 8.00026 10C4.84026 10 2.27359 12.0867 2.27359 14.6667" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" />
     </svg>
);

const PhoneIcon: React.FC = () => (
     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.6673 11.2667V13.2667C14.6673 13.8 14.334 14.2667 13.8673 14.3333C13.734 14.3533 13.6007 14.3533 13.4673 14.3333C10.6007 14.0667 7.93398 12.9333 5.80065 11.0667C3.86732 9.4 2.46732 7.13333 1.80065 4.66667C1.66732 4.2 1.66732 3.73333 1.80065 3.26667C1.93398 2.8 2.33398 2.46667 2.80065 2.46667H4.80065C4.93398 2.46667 5.06732 2.53333 5.13398 2.66667C5.20065 2.8 5.20065 2.93333 5.13398 3.06667L4.66732 4.46667C4.60065 4.66667 4.66732 4.86667 4.80065 5L6.40065 6.6C7.40065 7.6 8.60065 8.8 9.60065 9.8L11.2007 11.4C11.334 11.5333 11.534 11.6 11.734 11.5333L13.134 11.0667C13.2673 11 13.4007 11 13.534 11.0667C13.6673 11.1333 13.734 11.2667 13.734 11.4L14.6673 11.2667Z" stroke="#292D32" strokeLinecap="round" strokeLinejoin="round" />
     </svg>
);

interface CustomInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
     type?: string;
     label?: string;
     placeholder?: string;
     value?: string;
     onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
     leftIcon?: React.ReactNode;
     showPasswordToggle?: boolean;
     className?: string;
     inputClassName?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
     type = "text",
     label,
     placeholder = "Placeholder",
     value = "",
     onChange = () => { },
     leftIcon,
     showPasswordToggle = false,
     className = "",
     inputClassName = "",
     ...props
}) => {
     const [showPassword, setShowPassword] = useState<boolean>(false);

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
          if(onChange) {
               onChange(e);
          }
     };

     const togglePasswordVisibility = (): void => {
          setShowPassword(!showPassword);
     };

     const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

     return (
          <div className={`w-full relative bg-white border border-[#DEDEDE] rounded-lg px-4 h-[56px] ${className}`}>
               {label && (
                    <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
                         {label}
                    </label>
               )}
               <div className="flex items-center">
                    {leftIcon && <div className="mr-1">{leftIcon}</div>}

                    <input
                         type={inputType}
                         placeholder={placeholder}
                         value={value}
                         onChange={handleInputChange}
                         className={`flex-1 bg-transparent ${leftIcon ? 'ml-1' : ''}border-0 smaller py-[18px] outline-none text-[#111111] placeholder-[#585858] text-sm leading-[20px] font-normal ${inputClassName}`}
                         {...props}
                    />

                    {(showPasswordToggle || type === "password") && (
                         <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="ml-2 focus:outline-none"
                         >
                              <EyeIcon isVisible={showPassword} />
                         </button>
                    )}
               </div>
          </div>
     );
};

export default CustomInput;
export { EmailIcon, LockIcon, EyeIcon, UserIcon, PhoneIcon };