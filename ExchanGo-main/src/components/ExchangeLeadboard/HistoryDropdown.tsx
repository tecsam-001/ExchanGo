import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
     value: string;
     label: string;
}

interface HistoryDropdownProps {
     options: DropdownOption[];
     defaultValue?: string;
     placeholder?: string;
     onSelect?: (option: DropdownOption) => void;
     className?: string;
     buttonClassName?: string;
     dropdownClassName?: string;
}

const HistoryDropdown: React.FC<HistoryDropdownProps> = ({
     options,
     defaultValue,
     placeholder = 'Select an option',
     onSelect,
     className = '',
     buttonClassName = '',
     dropdownClassName = ''
}) => {
     const [isOpen, setIsOpen] = useState<boolean>(false);
     const [selectedOption, setSelectedOption] = useState<string>(
          defaultValue || options[0]?.label || placeholder
     );
     const dropdownRef = useRef<HTMLDivElement>(null);

     const toggleDropdown = () => {
          setIsOpen(!isOpen);
     };

     const handleOptionSelect = (option: DropdownOption) => {
          setSelectedOption(option.label);
          setIsOpen(false);
          onSelect?.(option);
     };

     useEffect(() => {
          const handleClickOutside = (event: MouseEvent) => {
               if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsOpen(false);
               }
          };
          document.addEventListener('mousedown', handleClickOutside);
          return () => {
               document.removeEventListener('mousedown', handleClickOutside);
          };
     }, []);

     useEffect(() => {
          const handleKeyDown = (event: KeyboardEvent) => {
               if (event.key === 'Escape') {
                    setIsOpen(false);
               }
          };
          document.addEventListener('keydown', handleKeyDown);
          return () => {
               document.removeEventListener('keydown', handleKeyDown);
          };
     }, []);

     return (
          <div className={`relative w-full lg:w-fit ${className}`} ref={dropdownRef}>
               <button
                    className={`border border-[#20523C] cursor-pointer rounded-lg h-[46px] px-5 flex items-center justify-center gap-2 text-[#20523C] text-[16px] font-medium leading-[22px] w-full ${buttonClassName}`}
                    onClick={toggleDropdown}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
               >
                    {selectedOption}
                    <svg
                         width="25"
                         height="25"
                         viewBox="0 0 25 25"
                         fill="none"
                         xmlns="http://www.w3.org/2000/svg"
                         className={`transition-transform duration-200 ${isOpen ? '' : '-rotate-180'}`}
                    >
                         <path d="M20.8713 15.2575L14.2612 8.64749C13.4806 7.86685 12.2032 7.86685 11.4225 8.64749L4.8125 15.2575" stroke="currentColor" strokeWidth="1.52072" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
               </button>

               {/* On dekstop */}
               {isOpen && (
                    <div
                         className={`py-1 bg-white w-full absolute top-[50px] z-40 rounded-md border border-gray-200 hidden lg:block ${dropdownClassName}`}
                         style={{
                              boxShadow: '0px 5px 5px 0px #00000029, 0px 4px 4px 0px #00000014'
                         }}
                         role="listbox"
                    >
                         {options.map((option, index) => (
                              <button
                                   key={option.value}
                                   className={`w-full py-2.5 text-left px-4 text-[#585858] text-[14px] font-normal leading-[20px] hover:bg-gray-50 transition-colors duration-150 ${index < options.length - 1 ? 'border-b border-[#DEDEDE]' : ''
                                        } ${option.label === selectedOption ? 'bg-[#F1F1F1]' : ''
                                        }`}
                                   onClick={() => handleOptionSelect(option)}
                                   role="option"
                                   aria-selected={option.label === selectedOption}
                              >
                                   {option.label}
                              </button>
                         ))}
                    </div>
               )}
               
               {/* on mobile */}
               {isOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 modal-backdrop"
                         style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                         onClick={() => setIsOpen(false)}>
                         <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-2xl transform transition-transform duration-300 ease-out"
                              onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-center pt-2 pb-[19px]">
                                   <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                              </div>
                              <div className="space-y-1 mb-6">
                                   {options.map((option, index) => (
                                        <button
                                             key={option.value}
                                             onClick={() => handleOptionSelect(option)}
                                             className={`px-5 w-full cursor-pointer text-left py-3 text-[14px] font-normal leading-[20px] text-[#111111] border-b border-[#DEDEDE] transition-colors hover:bg-gray-50 ${option.label === selectedOption ? 'bg-[#F1F1F1]' : ''
                                                  }`}
                                        >
                                             {option.label}
                                        </button>
                                   ))}
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
};

export default HistoryDropdown;