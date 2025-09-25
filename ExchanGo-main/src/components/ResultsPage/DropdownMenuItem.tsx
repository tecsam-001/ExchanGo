import React, { useState } from 'react';
import Image from 'next/image';

interface DropdownMenuItemProps {
    iconSrc: string;
    altText: string;
    label: string;
    onClick?: () => void;
    isActive?: boolean;
    isLast?: boolean;
}

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
    iconSrc,
    altText,
    label,
    onClick,
    isActive = false,
    isLast = false,
}) => {
    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <li className={`${!isLast ? 'border-b border-[#DEDEDE]' : ''}`}>
            <button
                className={`flex items-center w-full px-4 py-2.5 text-[14px] leading-[20px] text-[#111111] hover:bg-[#F1F1F1] ${isActive ? 'bg-[#F1F1F1] !important' : ''}`}
                onClick={handleClick}
            >
                <Image src={iconSrc} alt={altText} width={16} height={16} className="mr-1.5" />
                {label}
            </button>
        </li>
    );
};

export default DropdownMenuItem; 
