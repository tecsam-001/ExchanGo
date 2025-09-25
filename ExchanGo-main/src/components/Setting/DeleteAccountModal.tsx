'use client'
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DeleteAccountModalProps {
     isOpen: boolean;
     onClose: () => void;
     onConfirm: () => void;
     deleteReason: string;
     setDeleteReason: (reason: string) => void;
}

const deleteReasons = [
     'We no longer offer exchange services',
     'The platform did not meet our expectations',
     'We received very few customer inquiries',
     'The service fees are too high',
     'We\'ve moved to another platform',
     'The features do not suit our business needs',
];

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
     isOpen,
     onClose,
     onConfirm,
     deleteReason,
     setDeleteReason,
}) => {
     const [touchStartY, setTouchStartY] = useState<number | null>(null);
     const [touchEndY, setTouchEndY] = useState<number | null>(null);

     const [dropdownOpen, setDropdownOpen] = useState(false);
     const [isMobile, setIsMobile] = useState(false);

     useEffect(() => {
          const checkMobile = () => setIsMobile(window.innerWidth < 640);
          checkMobile();
          window.addEventListener('resize', checkMobile);
          return () => window.removeEventListener('resize', checkMobile);
     }, []);


     if (!isOpen) return null;

     const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
          if (e.target === e.currentTarget) onClose();
     };

     const toggleDropdown = () => setDropdownOpen(prev => !prev);

     const handleOptionSelect = (option: string) => {
          setDeleteReason(option);
          setDropdownOpen(false);
     };

     const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
          setTouchStartY(e.touches[0].clientY);
     };

     const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
          setTouchEndY(e.touches[0].clientY);
     };

     const handleTouchEnd = () => {
          if (touchStartY !== null && touchEndY !== null && touchEndY - touchStartY > 50) {
               // Swipe down detected
               setDropdownOpen(false);
          }
          setTouchStartY(null);
          setTouchEndY(null);
     };

     const handleDelete = () => {
          console.log('About to show toast');
          toast.success('Account deleted successfully!', {
               position: 'top-right',
               autoClose: 2500,
               hideProgressBar: false,
               closeOnClick: true,
               pauseOnHover: true,
               draggable: true,
               progress: undefined,
          });
          onConfirm();
     };

     return (
          <div
               className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
               onClick={handleOverlayClick}
          >
               <div className="bg-white rounded-2xl p-5 sm:p-10 w-full max-w-[461px] mx-auto">
                    <h2 className="text-[16px] sm:text-[20px] sm:leading-[24px] leading-[19px] font-bold text-[#111111] mb-1 sm:mb-1.5">
                         Delete Account ?
                    </h2>
                    <p className="text-[#585858] text-[12px] sm:text-[14px] leading-[17px] sm:leading-[20px] font-normal mb-2.5 sm:mb-6">
                         Are you sure you want to Delete your account ?
                    </p>
                    <p className="text-[#BF1212] text-[12px] sm:text-[14px] leading-[17px] sm:leading-[20px] font-normal mb-6 sm:mb-8">
                         <span className="font-bold">Warning</span> this is permanent and cannot be undone!
                    </p>

                    {/* Dropdown */}
                    <div className="mb-4 sm:mb-8 relative">
                         <div
                              className="w-full relative bg-white border rounded-lg px-4 h-[56px] border-[#DEDEDE] cursor-pointer"
                              onClick={toggleDropdown}
                         >
                              <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
                                   Why do you leave
                              </label>
                              <div className="h-full flex items-center justify-between gap-3 text-[#585858] text-[14px] font-normal">
                                   <div className="line-clamp-1 overflow-hidden text-ellipsis  flex-1 leading-[20px]">
                                        {deleteReason || 'Choose an option'}
                                   </div>
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

                         </div>

                         {dropdownOpen && (
                              isMobile ? (
                                   <div
                                        className={`
                                             fixed inset-x-0  bottom-0 z-50 bg-white rounded-t-2xl pb-8 max-h-[340px] overflow-y-auto
                                             shadow-[0_-2px_20px_rgba(0,0,0,0.1)]
                                             transform transition-transform duration-300
                                             ${dropdownOpen ? 'translate-y-0' : 'translate-y-full'}
                                        `}
                                   >
                                        <div
                                             className="w-11 h-[5px] bg-[#E3E3E3] rounded-full mx-auto mt-2 mb-[19px] cursor-pointer"
                                             onTouchStart={handleTouchStart}
                                             onTouchMove={handleTouchMove}
                                             onTouchEnd={handleTouchEnd}
                                        />
                                        {deleteReasons.map((reason, index) => (
                                             <div
                                                  key={index}
                                                  onClick={() => handleOptionSelect(reason)}
                                                  className={`py-3 px-5 border-b border-[#DEDEDE] text-[14px] leading-[20px] font-normal cursor-pointer ${reason === deleteReason ? 'bg-[#F1F1F1]' : 'bg-white'
                                                       } text-[#585858]`}
                                             >
                                                  {reason}
                                             </div>
                                        ))}
                                   </div>

                              ) : (
                                   // Desktop Dropdown
                                   <div
                                        className="absolute z-10 mt-1.5 bg-white rounded-md w-full py-1 max-h-[248px] overflow-y-auto"
                                        style={{ boxShadow: '0px 30px 80px 0px #00000029' }}
                                   >
                                        {deleteReasons.map((reason, index) => (
                                             <div
                                                  key={index}
                                                  onClick={() => handleOptionSelect(reason)}
                                                  className={`py-2.5 px-4 border-b border-[#DEDEDE] last:border-b-0 text-[14px] leading-[20px] font-normal cursor-pointer ${reason === deleteReason ? 'bg-[#F1F1F1]' : 'bg-white'
                                                       } text-[#585858]`}
                                             >
                                                  {reason}
                                             </div>
                                        ))}
                                   </div>
                              )
                         )}

                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 items-end justify-end">
                         <button
                              onClick={onClose}
                              className="w-full sm:w-[101px] h-10 sm:h-[46px] bg-[#F0F0F0] text-[#20523C] text-[16px] leading-[22px] rounded-md px-6 font-medium cursor-pointer"
                         >
                              Cancel
                         </button>
                         <button
                              onClick={handleDelete}
                              disabled={!deleteReason}
                              className={`w-full sm:w-[99px] h-10 sm:h-[46px] px-6 text-[16px] leading-[22px] rounded-md font-semibold ${deleteReason ? 'bg-[#BF1212] text-white cursor-pointer' : 'bg-[#BF1212] text-white cursor-not-allowed'
                                   }`}
                         >
                              Delete
                         </button>

                    </div>
               </div>
          </div>
     );
};

export default DeleteAccountModal;
