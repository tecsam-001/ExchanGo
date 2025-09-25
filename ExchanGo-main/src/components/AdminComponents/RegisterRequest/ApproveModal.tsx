import ArrowBack from '@/components/SvgIcons/ArrowBack';
import Image from 'next/image';
import React from 'react';

interface FieldRowProps {
     label: string;
     value: string | React.ReactNode;
     className?: string;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value, className = "" }) => {
     return (
          <div className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-4 ${className}`}>
               <div className="w-full md:max-w-[261px] flex items-center gap-1 md:gap-4 md:justify-between">
                    <h2 className='text-[#585858] text-[12px] md:text-[14px] leading-[17px] md:leading-[20px] font-normal'>{label}</h2>
                    <h3 className='hidden md:block text-[#585858] text-[14px] leading-[20px] font-normal'>:</h3>
               </div>
               {typeof value === 'string' ? (
                    <h2 className="text-[#111111] text-[14px] leading-[20px] font-medium md:font-normal">{value}</h2>
               ) : (
                    <div>{value}</div>
               )}
          </div>
     );
};

const CopyableField: React.FC<{ value: string; onCopy?: () => void }> = ({ value, onCopy }) => {
     const [copied, setCopied] = React.useState(false);

     const handleCopy = async () => {
          try {
               await navigator.clipboard.writeText(value);
               setCopied(true);
               onCopy?.();

               setTimeout(() => {
                    setCopied(false);
               }, 2000);
          } catch (err) {
               console.error('Failed to copy text: ', err);
          }
     };

     return (
          <div className="flex items-center gap-2 relative">
               <h2 className="text-[#111111] text-[14px] leading-[20px] font-medium md:font-normal">{value}</h2>
               <button
                    onClick={handleCopy}
                    className={`p-0.5 rounded transition-all duration-200 cursor-pointer ${copied
                         ? 'bg-green-100 text-green-600'
                         : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                         }`}
                    title={copied ? "Copied!" : "Copy to clipboard"}
               >
                    {copied ? (
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20,6 9,17 4,12"></polyline>
                         </svg>
                    ) : (
                         <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10.6693 8.60065V11.4007C10.6693 13.734 9.73594 14.6673 7.4026 14.6673H4.6026C2.26927 14.6673 1.33594 13.734 1.33594 11.4007V8.60065C1.33594 6.26732 2.26927 5.33398 4.6026 5.33398H7.4026C9.73594 5.33398 10.6693 6.26732 10.6693 8.60065Z" stroke="#969696" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M14.6693 4.60065V7.40065C14.6693 9.73398 13.7359 10.6673 11.4026 10.6673H10.6693V8.60065C10.6693 6.26732 9.73594 5.33398 7.4026 5.33398H5.33594V4.60065C5.33594 2.26732 6.26927 1.33398 8.6026 1.33398H11.4026C13.7359 1.33398 14.6693 2.26732 14.6693 4.60065Z" stroke="#969696" strokeLinecap="round" strokeLinejoin="round" />
                         </svg>

                    )}
               </button>
          </div>
     );
};

interface ApproveModalProps {
     open: boolean;
     onClose: () => void;
     onApprove: () => void;
     onReject: () => void;
     data: {
          email: string;
          officeName: string;
          commercialRegNumber: string;
          currencyLicenseNumber: string;
          address: string;
          city: string;
          province: string;
          primaryPhone: string;
          whatsapp: string;
          geolocation?: string;
     };
}

const ApproveModal: React.FC<ApproveModalProps> = ({ open, onClose, onApprove, onReject, data }) => {
     if (!open) return null;

     return (
          <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto md:flex md:items-center md:justify-center md:w-full hide-scrollbar">
               <div className="bg-white md:rounded-[16px] w-full md:max-w-[654px] relative shadow-lg">
                    {/* Mobile Header */}
                    <div className='flex md:hidden flex-col gap-6 w-full px-5 pt-[18px]'>
                         <button
                              className="cursor-pointer text-[#585858] text-[16px] leading-[24px] font-medium flex items-center gap-1.5"
                              onClick={onClose}
                              aria-label="Back"
                         >
                              <ArrowBack />
                              Back
                         </button>
                         <h2 className="text-[#111111] leading-[24px] text-[18px] font-bold">Atlas Exchange Registration</h2>
                    </div>

                    {/* Desktop Header */}
                    <div className='hidden md:flex items-center justify-between w-full px-10 py-[18px] border-b border-[#DEDEDE]'>
                         <h2 className="text-[#111111] leading-[24px] text-[18px] font-bold">Atlas Exchange Registration</h2>
                         <button
                              className="cursor-pointer"
                              onClick={onClose}
                              aria-label="Close"
                         >
                              <Image src='/assets/close-modal.svg' alt='close-modal' width={24} height={24} />
                         </button>
                    </div>

                    <div className='px-5 md:px-10 pt-6 pb-8 md:pb-[56px]'>
                         {/* Main Information */}
                         <div className="mb-6">
                              <div className="text-[16px] font-semibold leading-[24px] mb-2.5">Main Information</div>
                              <FieldRow label="Email" value={data.email} />
                         </div>

                         {/* Office Information */}
                         <div className="mb-6">
                              <div className="text-[16px] font-semibold leading-[24px] mb-2.5">Office Information</div>
                              <div className='space-y-3 md:space-y-2.5'>
                                   <FieldRow label="Office name" value={data.officeName} />
                                   <FieldRow
                                        label="Commercial Registration Number"
                                        value={<CopyableField value={data.commercialRegNumber} />}
                                   />
                                   <FieldRow
                                        label="Currency Exchange License Number"
                                        value={<CopyableField value={data.currencyLicenseNumber} />}
                                   />
                                   <FieldRow label="Street Address" value={data.address} />
                                   <FieldRow label="City" value={data.city} />
                                   <FieldRow label="Province" value={data.province} />
                                   <FieldRow label="Primary phone number" value={data.primaryPhone} />
                                   <FieldRow label="Whatsapp number" value={data.whatsapp} />
                              </div>
                         </div>

                         {/* Maps Information */}
                         <div>
                              <div className="text-[16px] font-semibold leading-[24px] mb-2.5">Maps Information</div>
                              <FieldRow
                                   label="Geolocation"
                                   value={
                                        data.geolocation ? (
                                             <img
                                                  src={data.geolocation}
                                                  alt="Geolocation"
                                                  className="w-64 h-28 object-cover rounded border"
                                             />
                                        ) : (
                                             <Image src='/assets/mapmodal.svg' alt='map' width={297} height={100} className='w-full md:w-fit h-[140px] md:h-[100px] object-cover rounded-lg' />
                                        )
                                   }
                                   className="items-start"
                              />
                         </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end md:flex-row flex-col gap-3 px-5 md:px-10 pb-5 md:py-5 md:border-t border-[#DEDEDE]">
                         <button
                              className="border border-[#20523C] rounded-lg h-[46px] px-5 w-full md:w-fit text-[#20523C] text-[16px] font-medium leading-[22px] cursor-pointer transition duration-300 hover:bg-[#20523C] hover:text-white"
                              onClick={onReject}
                         >
                              Reject this request
                         </button>
                         <button
                              onClick={onApprove}
                              className="px-6 w-full md:w-fit h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-[16px] font-semibold leading-[22px]"
                              style={{
                                   background: 'radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)',
                                   border: '1px solid rgba(255, 255, 255, 0.4)',
                                   boxShadow: '0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset'
                              }}
                         >
                              Approve
                         </button>
                    </div>
               </div>
          </div>
     );
};

export default ApproveModal;