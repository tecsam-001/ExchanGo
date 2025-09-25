'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import Dashboard from './SvgIcons/Dashboard';
import ExchangeLeaderboard from './SvgIcons/ExchangeLeaderboard';
import Setting from './SvgIcons/Setting';

interface NavItem {
     href: string;
     label: string;
     icon: React.ReactNode;
}

const navItems: NavItem[] = [
     { href: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
     { href: '/exchange-leadboard', label: 'Exchange Leadboard', icon: <ExchangeLeaderboard /> },
     { href: '/setting', label: 'Setting', icon: <Setting /> },
];

const Sidebar: React.FC = () => {
     const pathname = usePathname();

     return (
          <div className="ml-5 w-[267px] lg:min-w-[267px] lg:max-w-[267px] flex-col gap-2 md:flex hidden">
               {navItems.map(({ href, label, icon }) => {
                    const isActive = pathname === href;
                    return (
                         <Link
                              key={href}
                              href={href}
                              className={`flex items-center text-nowrap gap-2 py-[15px] px-4 text-[16px] font-normal rounded-lg transition-colors ${isActive ? 'bg-[#F1F1F1] text-[#111111]' : 'text-[#111111] hover:bg-[#F9F9F9]'
                                   }`}
                         >
                              {icon} {label}
                         </Link>
                    );
               })}
          </div>
     );
};

export default Sidebar;
