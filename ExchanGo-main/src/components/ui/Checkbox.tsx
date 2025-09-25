import React from 'react'

interface CheckboxProps {
     checked: boolean;
     onChange: (checked: boolean) => void;
     label?: string;
     className?: string;
     disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
     checked,
     onChange,
     label,
     className = '',
     disabled = false
}) => {
     const handleClick = () => {
          if (!disabled) {
               onChange(!checked);
          }
     };

     return (
          <div
               className={`flex items-start gap-2.5 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
               onClick={handleClick}
          >
               <div className={`w-[20px] h-[20px] rounded border flex-shrink-0 flex items-center justify-center transition-colors ${checked
                         ? 'bg-[#20523C] border-[#20523C]'
                         : 'border-[#DEDEDE] bg-white'
                    } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    {checked && (
                         <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.3307 1.33789L4.9974 8.67122L1.66406 5.33789" stroke="white" strokeWidth="1.33333" strokeLinecap="square" />
                         </svg>
                    )}
               </div>
               {label && (
                    <span className="text-[#585858] text-sm leading-[20px] font-normal text-left select-none">
                         {label}
                    </span>
               )}
          </div>
     )
}

export default Checkbox