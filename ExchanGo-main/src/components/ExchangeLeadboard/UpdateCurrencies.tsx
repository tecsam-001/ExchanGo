import React from "react";

interface UpdateCurrenciesProps {
  onUpdate: () => void;
  disabled?: boolean;
}

const UpdateCurrencies: React.FC<UpdateCurrenciesProps> = ({
  onUpdate,
  disabled = false,
}) => {
  const gradientButtonStyle = {
    background: "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    boxShadow: "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset"
  };

  return (
    <button
      onClick={onUpdate}
      disabled={disabled}
      className={`cursor-pointer rounded-md h-[40px] md:h-[46px] px-6 text-[16px] font-medium leading-[22px] transition-all duration-200 ${
        disabled
          ? "opacity-50 cursor-not-allowed text-[#585858] border-[#585858]"
          : "text-[#20523C]"
      }`}
      style={disabled ? {} : gradientButtonStyle}
    >
      Update
    </button>
  );
};

export default UpdateCurrencies;
