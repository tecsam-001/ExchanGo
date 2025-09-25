import React from "react";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-6 h-[46px] rounded-md relative text-[#20523C] text-base font-semibold leading-[22px] ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${className}`}
      style={{
        background:
          "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        boxShadow:
          "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;
