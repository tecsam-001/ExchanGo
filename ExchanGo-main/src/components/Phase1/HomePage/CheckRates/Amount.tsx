import React, { ChangeEvent } from 'react';

interface AmountInputProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    error: boolean;
    symbol: string;
}

const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, error, symbol }) => {
    return (
        <div>
            <label className={` text-[12px] sm:text-[14px] font-medium leading-[17px] sm:leading-[20px] mb-1 ${error ? "text-red-500" : "text-[#111111]"}`}>
                Amount to exchange
            </label>
            <div className="flex items-center">
                <span className="text-[14px] sm:text-[18px] text-[#585858] font-normal mr-1">
                    {symbol}
                </span>
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    placeholder="e.g. 1"
                    className="flex-1 bg-transparent placeholder:text-[#585858] text-[14px] smaller sm:text-[18px] font-normal text-[#585858] outline-none"
                />
            </div>
        </div>
    );
};

export default AmountInput;