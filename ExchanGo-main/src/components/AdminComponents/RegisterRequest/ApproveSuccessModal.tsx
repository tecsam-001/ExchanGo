import Image from 'next/image';
import React from 'react';

interface ApproveSuccessModalProps {
    open: boolean;
    onClose: () => void;
}

const ApproveSuccessModal: React.FC<ApproveSuccessModalProps> = ({ open, onClose }) => {
    if (!open) return null;

    return (
        <div
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5'
        >
            <div className='bg-white rounded-2xl w-full max-w-[529px] mx-auto text-center relative overflow-hidden'>
                <div className='relative z-10'>
                    <div className="relative mb-6 w-full">
                        <Image src='/assets/confeti.svg' alt='confeti' width={1000} height={150} />
                        <Image src='/assets/password-update.svg' alt='password-update' width={140} height={115} className='max-w-[120px] sm:max-w-[140px] mx-auto -mt-[60px] sm:-mt-[110px]' />
                    </div>

                    <div className='px-5'>
                        <h2 className='text-[#111111] text-[20px] leading-[24px] font-bold mb-2 mt-10'>Validation Succesfully !</h2>
                        <p className='text-[#585858] text-[14px] font-normal leading-[20px] mb-4'>Atlas Exchnage request has been approved !</p>

                        <button
                            onClick={onClose}
                            className="mb-9 w-full sm:w-[194px] h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-base font-semibold leading-[22px]"
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
            </div>
        </div>
    );
};

export default ApproveSuccessModal; 