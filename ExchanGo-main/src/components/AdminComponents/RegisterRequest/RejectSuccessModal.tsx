import Image from 'next/image';
import React from 'react';

interface RejectSuccessModalProps {
    open: boolean;
    onClose: () => void;
}

const RejectSuccessModal: React.FC<RejectSuccessModalProps> = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
            <div className="bg-white rounded-[16px] py-9 px-5 sm:px-10 w-full max-w-[529px] flex flex-col items-center">
                <div className="mt-[24px] md:mt-10">
                    <Image src='/assets/checkbox-logo.svg' alt='checkbox' width={140} height={140} />
                </div>
                <h2 className="mt-5 md:mt-[46px] text-[#111111] text-[20px] leading-[24px] font-bold mb-2 text-center">The request has been rejected</h2>
                <p className="mb-6 md:mb-4 text-[#585858] text-[14px] leading-[20px] text-center">Registrants will receive this message later</p>

                <button
                    onClick={onClose}
                    className="w-[194px] h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-[16px] font-semibold leading-[22px]"
                    style={{
                        background: 'radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        boxShadow: '0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset'
                    }}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default RejectSuccessModal;
