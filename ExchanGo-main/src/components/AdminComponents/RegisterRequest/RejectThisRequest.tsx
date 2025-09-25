import React, { useState, useEffect } from 'react';
import RejectSuccessModal from './RejectSuccessModal';

interface RejectThisRequestProps {
    open: boolean;
    onClose: () => void;
    onSend: (reason: string, message: string) => void;
    loading?: boolean;
}

const REJECT_OPTIONS = [
    'Some info is missing',
    'not available in your area ',
    'Already registered ',
    'Registration is over ',
    'Registration does not fit the requirements ',
    'Other',
];

const RejectThisRequest: React.FC<RejectThisRequestProps> = ({ open, onClose, onSend, loading }) => {
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [customReason, setCustomReason] = useState('');

    // Detect mobile on mount
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!open) return null;

    const handleSend = () => {
        if (reason) {
            const finalReason = reason === 'Other' ? customReason : reason;
            onSend(finalReason, message);
            setReason('');
            setCustomReason('');
            setMessage('');
            setSuccessOpen(true);
        }
    };

    const handleOptionSelect = (option: string) => {
        setReason(option);
        setDropdownOpen(false);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
                <div className="bg-white rounded-[16px] p-5 md:p-10 w-full max-w-[461px] relative">
                    <h2 className="text-[16px] sm:text-[20px] text-[#111111] leading-[19px] sm:leading-[24px] font-bold mb-1 md:mb-1.5">Reject this request ?</h2>
                    <p className="text-[12px] sm:text-[14px] leading-[17px] sm:leading-[20px] font-normal text-[#585858] mb-6">What is the reason this request was rejected?</p>

                    <div className="mb-6 relative">
                        <label
                            className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111] z-10"
                            style={{ pointerEvents: 'none' }}
                        >
                            Option
                        </label>
                        <div
                            className="w-full relative bg-white border rounded-lg px-3 h-[56px] border-[#DEDEDE] cursor-pointer flex items-center"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            tabIndex={0}
                        >
                            <span className={`flex-1 text-[14px] font-normal truncate leading-[20px] ${reason ? 'text-[#111111]' : 'text-[#585858]'}`}>
                                {reason || 'Choose an option'}
                            </span>
                            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M19.9181 7.45898L13.3981 12.8923C12.6281 13.534 11.3681 13.534 10.5981 12.8923L4.07812 7.45898"
                                    stroke="#292D32"
                                    strokeWidth="1.26726"
                                    strokeMiterlimit="10"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        {dropdownOpen && (
                            isMobile ? (
                                // Mobile: Bottom sheet style
                                <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl pb-8 max-h-[340px] overflow-y-auto shadow-[0_-2px_20px_rgba(0,0,0,0.1)]">
                                    <div className="w-11 h-[5px] bg-[#E3E3E3] rounded-full mx-auto mt-2 mb-[19px]" />
                                    {REJECT_OPTIONS.map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => { handleOptionSelect(option); setDropdownOpen(false); }}
                                            className={`py-3 px-5 border-b border-[#DEDEDE] text-[14px] leading-[20px] font-normal cursor-pointer ${option === reason ? 'bg-[#F1F1F1]' : 'bg-white'
                                                } text-[#585858]`}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div
                                    className="absolute z-20 mt-1.5 bg-white rounded-md w-full py-1 max-h-[248px] overflow-y-auto shadow-[0_4px_24px_rgba(0,0,0,0.08)]"
                                >
                                    {REJECT_OPTIONS.map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => { handleOptionSelect(option); setDropdownOpen(false); }}
                                            className={`py-2.5 px-4 border-b border-[#DEDEDE] last:border-b-0 text-[14px] leading-[20px] font-normal cursor-pointer ${option === reason ? 'bg-[#F1F1F1]' : 'bg-white'
                                                } text-[#585858] hover:bg-[#F1F1F1]`}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                    {reason === 'Other' && (
                        <div className="mb-6 w-full relative bg-white border border-[#DEDEDE] rounded-lg py-[18px] px-4 h-[56px] flex items-center">
                            <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
                                Other Reason
                            </label>
                            <input
                                type="text"
                                placeholder="Enter other reason"
                                value={customReason}
                                onChange={e => setCustomReason(e.target.value)}
                                className='flex-1 bg-transparent border-0 outline-none smaller text-[#111111] placeholder-[#585858] text-sm leading-[20px] font-normal'
                            />
                        </div>
                    )}

                    <div className='mb-4 md:mb-8 w-full relative bg-white border border-[#DEDEDE] rounded-lg py-3 px-4'>
                        <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
                            Additional Message
                        </label>
                        <textarea
                            placeholder="Type your message"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                            className='flex-1 bg-transparent border-0 outline-none text-[#111111] hide-scrollbar placeholder:text-[#585858] text-sm leading-[20px] font-normal resize-none w-full'
                            style={{ minHeight: '80px' }}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            className="px-6 w-fit h-[40px] sm:h-[46px] rounded-md bg-[#F0F0F0] text-[#20523C] text-[16px] leading-[22px] font-medium"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={(!reason || (reason === 'Other' && !customReason) || loading)}
                            className={`w-[88px] h-[40px] sm:h-[46px] rounded-md relative text-[16px] font-semibold leading-[22px] transition
                                ${(reason && (reason !== 'Other' || customReason) && !loading)
                                    ? 'text-[#20523C] cursor-pointer'
                                    : 'text-[#20523C]/60 bg-red-500 cursor-not-allowed'
                                }
                            `}
                            style={{
                                background: 'radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.4)',
                                boxShadow: '0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset'
                            }}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
            <RejectSuccessModal
                open={successOpen}
                onClose={() => setSuccessOpen(false)}
            />
        </>
    );
};

export default RejectThisRequest;