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
const AdminBottomBar: React.FC = () => {
     const pathname = usePathname();
     const navItems: NavItem[] = [
          {
               id: 'dashboard',
               label: 'Dashboard',
               href: '/admin/dashboard',
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
               id: 'register-request',
               label: 'Register Request',
               href: '/admin/register-request',
               icon: (isActive: boolean) => (
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M8.51562 12.375H15.6123" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.52072" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M8.51562 16.4297H12.9561" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.52072" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M10.5432 6.08845H14.5985C16.6261 6.08845 16.6261 5.07464 16.6261 4.06082C16.6261 2.0332 15.6123 2.0332 14.5985 2.0332H10.5432C9.52944 2.0332 8.51562 2.0332 8.51562 4.06082C8.51562 6.08845 9.52944 6.08845 10.5432 6.08845Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.52072" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M16.6249 4.08203C20.0008 4.26452 21.6939 5.5115 21.6939 10.1446V16.2275C21.6939 20.2827 20.6801 22.3103 15.611 22.3103H9.52818C4.45912 22.3103 3.44531 20.2827 3.44531 16.2275V10.1446C3.44531 5.52164 5.13838 4.26452 8.51437 4.08203" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.52072" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
               ),
          },
          {
               id: 'analytics',
               label: 'Analytics',
               href: '/admin/analytics',
               icon: (isActive: boolean) => (
                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                         <path d="M2.47656 22.3105H22.7528" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.52072" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M10.3281 4.06082V22.3094H14.8903V4.06082C14.8903 2.94563 14.4341 2.0332 13.0654 2.0332H12.153C10.7843 2.0332 10.3281 2.94563 10.3281 4.06082Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.52072" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M3.48438 10.1448V22.3105H7.53962V10.1448C7.53962 9.02962 7.13409 8.11719 5.91752 8.11719H5.10647C3.8899 8.11719 3.48438 9.02962 3.48438 10.1448Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.52072" strokeLinecap="round" strokeLinejoin="round" />
                         <path d="M17.6797 15.2132V22.3098H21.7349V15.2132C21.7349 14.098 21.3294 13.1855 20.1128 13.1855H19.3018C18.0852 13.1855 17.6797 14.098 17.6797 15.2132Z" stroke={isActive ? "#20523C" : "rgba(17, 17, 17, 0.4)"} strokeWidth="1.52072" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
               ),
          },
          {
               id: 'settings',
               label: 'Setting',
               href: '/admin/setting',
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
          <nav className="fixed bottom-0 z-40 md:hidden block h-[60px] left-0 right-0 bg-white py-[8.22px]" style={{ boxShadow: "0px -4.06px 12.17px 0px #00000014" }}>
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
export default AdminBottomBar