import React, { useState } from 'react';

interface ToggleButtonProps {
     defaultChecked?: boolean;
     checked?: boolean;
     onChange?: (checked: boolean) => void;
     width?: string;
     height?: string;
     size?: 'sm' | 'md' | 'lg' | 'xl';
     disabled?: boolean;
     colors?: {
          on: string;
          off: string;
     };
     className?: string;
     'aria-label'?: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
     defaultChecked = false,
     checked,
     onChange,
     width,
     height,
     size = 'md',
     disabled = false,
     colors = {
          on: 'bg-green-500',
          off: 'bg-gray-300'
     },
     className = '',
     'aria-label': ariaLabel,
     ...props
}) => {
     const [internalChecked, setInternalChecked] = useState(defaultChecked);

     const isChecked = checked !== undefined ? checked : internalChecked;

     const handleToggle = () => {
          if (disabled) return;

          const newChecked = !isChecked;

          if (checked === undefined) {
               setInternalChecked(newChecked);
          }

          onChange?.(newChecked);
     };

     const sizeClasses = {
          sm: { container: 'w-8 h-4', circle: 'w-3 h-3', translate: 'translate-x-4' },
          md: { container: 'w-[36.5px] h-[20.28px]', circle: 'w-[16.22px] h-[16.22px]', translate: 'translate-x-[19px]' },
          lg: { container: 'w-[36px] md:w-[42px] h-[20px] md:h-6', circle: 'w-[16px] h-[16px] md:w-[18px] md:h-[18px]', translate: 'translate-x-[18px] md:translate-x-[22px]' },
          xl: { container: 'w-20 h-10', circle: 'w-9 h-9', translate: 'translate-x-10' }
     };

     const dimensions = size ? sizeClasses[size] : {
          container: `${width || 'w-[42px]'} ${height || 'h-6'}`,
          circle: 'w-5 h-5',  
          translate: 'translate-x-6' 
     };

     return (
          <button
               type="button"
               role="switch"
               aria-checked={isChecked}
               aria-label={ariaLabel}
               disabled={disabled}
               onClick={handleToggle}
               className={`
        relative inline-flex items-center rounded-[116px] transition-colors duration-200 ease-in-out focus:outline-none
        ${dimensions.container}
        ${isChecked ? colors.on : colors.off}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
               {...props}
          >
               <span
                    className={`
          inline-block rounded-full bg-white shadow-lg transform transition-transform duration-200 ease-in-out
          ${dimensions.circle}
          ${isChecked ? dimensions.translate : 'translate-x-0.5'}
        `}
               />
          </button>
     );
};

export default ToggleButton;