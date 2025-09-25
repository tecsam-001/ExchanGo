import Image from 'next/image';
import React, { useRef, useState, useEffect, useMemo } from 'react';

interface ActivityData {
     officeName: string;
     city: string;
     country: string;
     registrationDate: string;
     status: 'Validated' | 'Pending' | 'Rejected';
     duration: number;
     registeredCount: string;
}

interface AboutExchangeOfficeProps {
    data: ActivityData[];
}

const AboutExchangeOffice: React.FC<AboutExchangeOfficeProps> = ({ data }) => {
     const tableContainerRef = useRef<HTMLDivElement>(null);
     const [showLeftShadow, setShowLeftShadow] = useState(false);
     const [showRightShadow, setShowRightShadow] = useState(true);  

     const [sortBy, setSortBy] = useState<string>('officeName');
     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

     useEffect(() => {
          const container = tableContainerRef.current;
          if (container) {
               const handleScroll = () => {
                    const { scrollLeft, scrollWidth, clientWidth } = container;
                    setShowLeftShadow(scrollLeft > 2);
                    setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 2);
               };

               handleScroll();

               container.addEventListener('scroll', handleScroll);
               window.addEventListener('resize', handleScroll);

               return () => {
                    container.removeEventListener('scroll', handleScroll);
                    window.removeEventListener('resize', handleScroll);
               };
          }
     }, []);

     const handleSort = (column: string) => {
          if (column === sortBy) {
               setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
               setSortBy(column);
               setSortOrder('asc');
          }
     };

     const sortedData = useMemo(() => {
          const sorted = [...data];
          const parseDuration = (str: string): number => {
               const match = str.match(/(\d+)/);
               return match ? parseInt(match[1], 10) : 0;
          };
          const parseRegisteredCount = (str: string): number => {
               const match = str.match(/(\d+)/);
               return match ? parseInt(match[1], 10) : 0;
          };
          sorted.sort((a, b) => {
               let aValue = a[sortBy as keyof ActivityData];
               let bValue = b[sortBy as keyof ActivityData];
               if (sortBy === 'registrationDate') {
                    const aValueNum = new Date(String(aValue)).getTime();
                    const bValueNum = new Date(String(bValue)).getTime();
                    return sortOrder === 'asc'
                         ? aValueNum - bValueNum
                         : bValueNum - aValueNum;
               }
               if (sortBy === 'registeredCount') {
                    const aNum = parseRegisteredCount(String(aValue));
                    const bNum = parseRegisteredCount(String(bValue));
                    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
               }
               if (sortBy === 'duration') {
                    const aNum = typeof aValue === 'number' ? aValue : parseDuration(String(aValue));
                    const bNum = typeof bValue === 'number' ? bValue : parseDuration(String(bValue));
                    return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
               }
               if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
                    return sortOrder === 'asc'
                         ? Number(aValue) - Number(bValue)
                         : Number(bValue) - Number(aValue);
               }
               if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'asc'
                         ? aValue.localeCompare(bValue)
                         : bValue.localeCompare(aValue);
               } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortOrder === 'asc'
                         ? aValue - bValue
                         : bValue - aValue;
               } else {
                    return 0;
               }
          });
          return sorted;
     }, [data, sortBy, sortOrder]);

     return (
          <div className="relative w-full bg-white rounded-lg border border-[#DEDEDE] overflow-hidden">
               <div
                    className="overflow-x-auto hide-scrollbar text-nowrap"
                    style={{ position: 'relative' }}
                    ref={tableContainerRef}
               >
                    <table className="w-full min-w-full">
                         <thead>
                              <tr className="bg-[#F3F4F8] border-b border-[#DEDEDE]">
                                   <th
                                        className="sticky border-r border-[#DEDEDE] left-0 bg-[#F3F4F8] z-20 px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] max-w-[155px] select-none cursor-pointer group"
                                        style={{ backgroundColor: '#F3F4F8' }}
                                        onClick={() => handleSort('officeName')}
                                   >
                                        <div className="flex items-center space-x-1">
                                             <Image src='/assets/sort-table.svg' alt='sort-table' width={14.39} height={14.39}
                                                  className={`transition-transform duration-200 ${sortBy === 'officeName' ? (sortOrder === 'desc' ? 'rotate-180' : '') : 'opacity-50'}`}
                                             />
                                             <span className='text-[#111111] text-[14px] leading-[17px] font-bold'>Office Name</span>
                                        </div>
                                   </th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] max-w-[155px] select-none cursor-pointer group" onClick={() => handleSort('city')}>
                                        <div className="flex items-center space-x-1">
                                             <Image src='/assets/sort-table.svg' alt='sort-table' width={14.39} height={14.39}
                                                  className={`transition-transform duration-200 ${sortBy === 'city' ? (sortOrder === 'desc' ? 'rotate-180' : '') : 'opacity-50'}`}
                                             />
                                             <span className='text-[#111111] text-[14px] leading-[17px] font-bold'>City</span>
                                        </div>
                                   </th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] max-w-[155px] select-none cursor-pointer group" onClick={() => handleSort('country')}>
                                        <div className="flex items-center space-x-1">
                                             <Image src='/assets/sort-table.svg' alt='sort-table' width={14.39} height={14.39}
                                                  className={`transition-transform duration-200 ${sortBy === 'country' ? (sortOrder === 'desc' ? 'rotate-180' : '') : 'opacity-50'}`}
                                             />
                                             <span className='text-[#111111] text-[14px] leading-[17px] font-bold'>Country</span>
                                        </div>
                                   </th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] max-w-[155px] select-none cursor-pointer group" onClick={() => handleSort('registrationDate')}>
                                        <div className="flex items-center space-x-1">
                                             <Image src='/assets/sort-table.svg' alt='sort-table' width={14.39} height={14.39}
                                                  className={`transition-transform duration-200 ${sortBy === 'registrationDate' ? (sortOrder === 'desc' ? 'rotate-180' : '') : 'opacity-50'}`}
                                             />
                                             <span className='text-[#111111] text-[14px] leading-[17px] font-bold'>Registration Date</span>
                                        </div>
                                   </th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] max-w-[155px] select-none cursor-pointer group" onClick={() => handleSort('status')}>
                                        <div className="flex items-center space-x-1">
                                             <Image src='/assets/sort-table.svg' alt='sort-table' width={14.39} height={14.39}
                                                  className={`transition-transform duration-200 ${sortBy === 'status' ? (sortOrder === 'desc' ? 'rotate-180' : '') : 'opacity-50'}`}
                                             />
                                             <span className='text-[#111111] text-[14px] leading-[17px] font-bold'>Status</span>
                                        </div>
                                   </th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] max-w-[155px] select-none cursor-pointer group" onClick={() => handleSort('duration')}>
                                        <div className="flex items-center space-x-1">
                                             <Image src='/assets/sort-table.svg' alt='sort-table' width={14.39} height={14.39}
                                                  className={`transition-transform duration-200 ${sortBy === 'duration' ? (sortOrder === 'desc' ? 'rotate-180' : '') : 'opacity-50'}`}
                                             />
                                             <span className='text-[#111111] text-[14px] leading-[17px] font-bold'>Duration</span>
                                        </div>
                                   </th>
                                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] max-w-[155px] select-none cursor-pointer group" onClick={() => handleSort('registeredCount')}>
                                        <div className="flex items-center space-x-1">
                                             <Image src='/assets/sort-table.svg' alt='sort-table' width={14.39} height={14.39}
                                                  className={`transition-transform duration-200 ${sortBy === 'registeredCount' ? (sortOrder === 'desc' ? 'rotate-180' : '') : 'opacity-50'}`}
                                             />
                                             <span className='text-[#111111] text-[14px] leading-[17px] font-bold truncate'>Registered Offices</span>
                                        </div>
                                   </th>
                              </tr>
                         </thead>
                         <tbody className="bg-white">
                              {sortedData.map((item, index) => (
                                   <tr key={index} className="border-b border-[#DEDEDE] last:border-b-0 group">
                                        <td
                                             className="group-hover:bg-gray-50 truncate cursor-pointer transition duration-150 sticky border-r border-[#DEDEDE] left-0 bg-white z-20 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858] min-w-[155px] max-w-[155px]"
                                             style={{
                                                  backgroundColor: 'white',  
                                             }}
                                        >
                                             {item.officeName}
                                        </td>
                                        <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                                             {item.city}
                                        </td>
                                        <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                                             {item.country}
                                        </td>
                                        <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                                             {item.registrationDate}
                                        </td>
                                        <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                                             <span
                                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                       item.status === 'Validated'
                                                            ? 'bg-[#A7F0BA] border border-[#159536] text-[#159536]'
                                                            : item.status === 'Pending'
                                                                 ? 'bg-[#9EF0F0] border border-[#088888] text-[#088888]'
                                                                 : 'bg-[#E0E0E0] border border-[#DEDEDE] text-[#777777]'
                                                  }`}
                                             >
                                                  {item.status}
                                             </span>
                                        </td>
                                        <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                                             {item.duration}
                                        </td>
                                        <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                                             {item.registeredCount}
                                        </td>
                                   </tr>
                              ))}
                         </tbody>
                    </table>
               </div>
               {showLeftShadow && (
                    <div
                         className="absolute inset-y-0 left-[155px] w-[30px] pointer-events-none"
                         style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 100%)', zIndex: 10 }}
                    />
               )}
               {showRightShadow && (
                    <div
                         className="absolute inset-y-0 right-0 w-[30px] pointer-events-none sm:block hidden"
                         style={{ background: 'linear-gradient(to left, rgba(0, 0, 0, 0.10) 0%, rgba(0,0,0,0) 100%)', zIndex: 10 }}
                    />
               )}
          </div>
     );
};

export default AboutExchangeOffice;