import React, { useState, ReactNode } from 'react';

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


interface AnimatedInputProps {
    label: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    icon?: ReactNode;
    error?: string;
    validation?: (value: string) => boolean;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    showPasswordToggle?: boolean;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
    label,
    type = 'text',
    value,
    onChange,
    onBlur,
    placeholder = '',
    icon,
    error,
    validation,
    className = '',
    disabled = false,
    required = false,
    showPasswordToggle = false
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [touched, setTouched] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus = () => {
        if (!disabled) {
            setIsFocused(true);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        setTouched(true);
        if (onBlur) {
            onBlur();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const isValid = validation ? validation(value) : true;
    const showError = touched && value.length > 0 && !isValid && error;

    const inputType = showPasswordToggle && type === 'password'
        ? (showPassword ? 'text' : 'password')
        : type;

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`relative w-full ${className}`}>
            <div className={`border border-[#DEDEDE] bg-white h-[56px] rounded-lg px-4 w-full flex items-center gap-1 transition-all duration-200 ${isFocused ? 'border-[#20523C]' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {icon && <div className="flex-shrink-0">{icon}</div>}
                <input
                    type={inputType}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={isFocused || value ? placeholder : ''}
                    disabled={disabled}
                    required={required}
                    className='h-full outline-none placeholder:text-[#585858] text-[#111111] text-[14px] smaller leading-[20px] font-normal bg-transparent w-full disabled:cursor-not-allowed'
                />
                {showPasswordToggle && type === 'password' && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="flex-shrink-0 p-1 text-[#585858] hover:text-[#20523C] transition-colors duration-200 focus:outline-none"
                        disabled={disabled}
                    >
                        <EyeIcon isVisible={showPassword} />
                    </button>
                )}
                <label
                    className={`absolute transition-all duration-200 pointer-events-none font-medium ${(isFocused || value)
                        ? 'text-[12px] leading-[17px] text-[#111111] left-3 top-[-8px] bg-white px-1'
                        : `text-[14px] leading-[20px] text-[#585858] ${icon ? 'left-10' : 'left-4'} top-1/2 -translate-y-1/2`
                        }`}
                    style={{
                        zIndex: 2,
                        background: (isFocused || value) ? 'white' : 'transparent',
                    }}
                >
                    {label}
                </label>
            </div>
            {showError && (
                <div className="text-red-500 text-xs text-left mt-1">{error}</div>
            )}
        </div>
    );
};

export default AnimatedInput;