'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
     id: string;
     label: string;
     href: string;
     icon: (isActive: boolean) => React.ReactNode;
}

const BottomNavBar: React.FC = () => {
     const pathname = usePathname();

     const navItems: NavItem[] = [
          {
               id: 'dashboard',
               label: 'Dashboard',
               href: '/dashboard',
               icon: (isActive: boolean) => (
                    <svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M23.5177 11.5198V4.53072C23.5177 2.989 22.8599 2.37231 21.2256 2.37231H17.0733C15.439 2.37231 14.7812 2.989 14.7812 4.53072V11.5198C14.7812 13.0616 15.439 13.6782 17.0733 13.6782H21.2256C22.8599 13.6782 23.5177 13.0616 23.5177 11.5198Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.54172" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M23.5177 20.7702V18.9201C23.5177 17.3784 22.8599 16.7617 21.2256 16.7617H17.0733C15.439 16.7617 14.7812 17.3784 14.7812 18.9201V20.7702C14.7812 22.3119 15.439 22.9286 17.0733 22.9286H21.2256C22.8599 22.9286 23.5177 22.3119 23.5177 20.7702Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.54172" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M11.6973 13.781V20.7701C11.6973 22.3118 11.0395 22.9285 9.40532 22.9285H5.25296C3.61874 22.9285 2.96094 22.3118 2.96094 20.7701V13.781C2.96094 12.2392 3.61874 11.6226 5.25296 11.6226H9.40532C11.0395 11.6226 11.6973 12.2392 11.6973 13.781Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.54172" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M11.6973 4.53072V6.38078C11.6973 7.9225 11.0395 8.53919 9.40532 8.53919H5.25296C3.61874 8.53919 2.96094 7.9225 2.96094 6.38078V4.53072C2.96094 2.989 3.61874 2.37231 5.25296 2.37231H9.40532C11.0395 2.37231 11.6973 2.989 11.6973 4.53072Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.54172" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
               ),
          },
          {
               id: 'exchange',
               label: 'Exchange leadboard',
               href: '/exchange-leadboard',
               icon: (isActive: boolean) => (
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M23.1378 15.7766C23.1378 19.8092 19.8763 23.0707 15.8438 23.0707L16.9378 21.2471" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.56301" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M2.29688 9.52452C2.29688 5.49195 5.55836 2.23047 9.59092 2.23047L8.49683 4.05398" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.56301" strokeLinecap="round" strokeLinejoin="round" />
                         <circle cx="17.5616" cy="5.35652" r="4.42853" fill="white" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.56301" />
                         <circle cx="20.6866" cy="9.52424" r="4.42853" fill="white" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.56301" />
                         <circle cx="20.6866" cy="5.35652" r="4.42853" fill="white" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.56301" />
                         <circle cx="7.50499" cy="18.5384" r="6.51254" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.56301" />
                         <path d="M5.42969 19.3162C5.42969 20.1232 6.05365 20.7721 6.81904 20.7721H8.38306C9.04862 20.7721 9.58939 20.2064 9.58939 19.4992C9.58939 18.7421 9.25662 18.4676 8.76578 18.2929L6.26163 17.4194C5.77078 17.2447 5.43802 16.9784 5.43802 16.2131C5.43802 15.5142 5.97876 14.9402 6.64431 14.9402H8.20836C8.97375 14.9402 9.59772 15.5891 9.59772 16.3961" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.38934" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M7.50781 14.1167V21.6042" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.38934" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
               ),
          },
          {
               id: 'settings',
               label: 'Setting',
               href: '/setting',
               icon: (isActive: boolean) => (
                    <svg width="26" height="25" viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M13.1928 15.7338C14.8957 15.7338 16.2762 14.3533 16.2762 12.6503C16.2762 10.9474 14.8957 9.56689 13.1928 9.56689C11.4899 9.56689 10.1094 10.9474 10.1094 12.6503C10.1094 14.3533 11.4899 15.7338 13.1928 15.7338Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.54172" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M2.91406 13.5549V11.7459C2.91406 10.677 3.7877 9.79308 4.86691 9.79308C6.72725 9.79308 7.48783 8.47748 6.55252 6.86381C6.01806 5.93878 6.33668 4.73624 7.27199 4.20178L9.0501 3.18424C9.86207 2.70117 10.9104 2.98896 11.3935 3.80093L11.5066 3.99621C12.4316 5.60988 13.9528 5.60988 14.8881 3.99621L15.0011 3.80093C15.4842 2.98896 16.5326 2.70117 17.3445 3.18424L19.1227 4.20178C20.058 4.73624 20.3766 5.93878 19.8421 6.86381C18.9068 8.47748 19.6674 9.79308 21.5277 9.79308C22.5967 9.79308 23.4806 10.6667 23.4806 11.7459V13.5549C23.4806 14.6238 22.6069 15.5077 21.5277 15.5077C19.6674 15.5077 18.9068 16.8233 19.8421 18.437C20.3766 19.3723 20.058 20.5645 19.1227 21.099L17.3445 22.1165C16.5326 22.5996 15.4842 22.3118 15.0011 21.4999L14.8881 21.3046C13.963 19.6909 12.4419 19.6909 11.5066 21.3046L11.3935 21.4999C10.9104 22.3118 9.86207 22.5996 9.0501 22.1165L7.27199 21.099C6.33668 20.5645 6.01806 19.362 6.55252 18.437C7.48783 16.8233 6.72725 15.5077 4.86691 15.5077C3.7877 15.5077 2.91406 14.6238 2.91406 13.5549Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.54172" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
               ),
          },
     ];

     const isActive = (href: string) => {
          return pathname === href;
     };

     return (
          <nav className="fixed bottom-0 md:hidden block h-[60px] left-0 right-0 bg-white py-[8.22px]" style={{ boxShadow: "0px -4.06px 12.17px 0px #00000014" }}>
               <div className="flex justify-around items-center max-w-md mx-auto">
                    {navItems.map((item) => (
                         <Link
                              key={item.id}
                              href={item.href}
                              className={`flex flex-col items-center justify-center rounded-lg transition-all duration-200 min-w-0 flex-1 ${isActive(item.href)
                                   ? 'text-[#20523C]'
                                   : 'text-[#111111]/40'
                                   }`}
                         >
                              <div className="mb-1.5">
                                   {item.icon(isActive(item.href))}
                              </div>
                              <span className="text-[10.28px] font-normal text-center leading-[12px]">
                                   {item.label}
                              </span>
                         </Link>
                    ))}
               </div>
          </nav>
     );
};

export default BottomNavBar;