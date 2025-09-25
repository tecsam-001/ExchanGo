import React, { useState } from 'react';

interface PasswordInputProps {
     label: string;
     placeholder?: string;
     value: string;
     onChange: (value: string) => void;
     error?: string;
     showToggle?: boolean;
     className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
     label,
     placeholder = 'Placeholder',
     value,
     onChange,
     error,
     showToggle = false,
     className = ''
}) => {
     const [showPassword, setShowPassword] = useState(false);

     const togglePasswordVisibility = () => {
          setShowPassword(prev => !prev);
     };

     return (
          <div className={`w-full space-y-1 ${className}`}>
               <div className='w-full relative bg-white border rounded-lg px-4 h-[56px] border-[#DEDEDE]'>
                    <label className='absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111] flex items-center gap-1'>
                         {label}
                    </label>
                    <div className='flex items-center'>
                         <input
                              type={showToggle && showPassword ? 'text' : 'password'}
                              placeholder={placeholder}
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              className='flex-1 bg-transparent py-[18px] border-0 outline-none text-[#111111] placeholder-[#585858] smaller text-sm leading-[20px] font-normal'
                         />
                         {showToggle && (
                              <button
                                   type="button"
                                   onClick={togglePasswordVisibility}
                                   className='ml-2'
                              >
                                   {showPassword ? (
                                        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <path d="M12.1083 8.6543L7.89167 12.871" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                             <path d="M14.8417 4.92096L5.15833 14.6043" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                             <path d="M6.94252 6.32096C3.50002 8.17096 1.66669 10.7626 1.66669 10.7626C1.66669 10.7626 4.16669 16.0959 10 16.0959C11.325 16.0959 12.55 15.721 13.625 15.096" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                             <path d="M7.01562 13.246C8.34896 13.246 9.99896 11.9126 9.99896 10.2626" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                   ) : (
                                        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <path d="M12.9823 10.2626C12.9823 11.9126 11.649 13.246 9.99896 13.246C8.34896 13.246 7.01562 11.9126 7.01562 10.2626C7.01562 8.61263 8.34896 7.2793 9.99896 7.2793C11.649 7.2793 12.9823 8.61263 12.9823 10.2626Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                             <path d="M9.99792 17.154C12.9396 17.154 15.6813 15.4206 17.5896 12.4206C18.3396 11.2456 18.3396 9.27064 17.5896 8.09564C15.6813 5.09564 12.9396 3.3623 9.99792 3.3623C7.05625 3.3623 4.31458 5.09564 2.40625 8.09564C1.65625 9.27064 1.65625 11.2456 2.40625 12.4206C4.31458 15.4206 7.05625 17.154 9.99792 17.154Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                   )}
                              </button>
                         )}
                    </div>
               </div>
               {error && (
                    <div className='flex items-center gap-1 text-red-500 text-xs'>
                         <span>{error}</span>
                    </div>
               )}
          </div>
     );
};

export default PasswordInput;