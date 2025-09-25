"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
   variant?: 'landing' | 'faq' | 'about-us';
}

const Header: React.FC<HeaderProps> = ({ variant = 'landing' }) => {
   const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false)

   const navItems = [
      { label: 'About', href: '/about-us' },
      { label: 'FAQ', href: '/faq' },
      { href: '/home', label: 'Register my office' },
      { href: 'https://blog.exchango24.com', label: 'Blog' }
   ];

   const getHeaderStyles = () => {
      switch (variant) {
         case 'landing':
            return {
               container: 'py-8 px-5 md:pt-[40px] md:pb-14 flex items-center relative',
               text: 'text-white',
               button: 'border border-[#3BEE5C] hover:bg-[#3BEE5C] hover:text-black',
               mobileMenu: 'bg-white text-[#585858]',
               mobileButton: 'border border-[#20523C] text-[#20523C] hover:bg-[#20523C] hover:text-white',
            };
         case 'faq':
         case 'about-us':
            return {
               container: 'bg-white border-b border-gray-200 py-8 px-5 md:py-[40px]',
               text: 'text-[#20523C]',
               button: 'border border-[#20523C] text-[#20523C] hover:bg-[#20523C] hover:text-white',
               mobileMenu: 'bg-white text-[#585858]',
               mobileButton: 'border border-[#20523C] text-[#20523C] hover:bg-[#20523C] hover:text-white',
            };
         default:
            return {
               container: 'bg-transparent',
               text: 'text-[#20523C]',
               button: 'border-white text-white hover:bg-white hover:text-green-700',
               mobileMenu: 'bg-white text-[#585858]',
               mobileButton: 'border border-[#20523C] text-[#20523C] hover:bg-[#20523C] hover:text-white',
            };
      }
   };

   const styles = getHeaderStyles();

   const handleMobileMenuItemClick = () => {
      setIsOpenMobileMenu(false);
   };

   const closeMenu = () => {
      setIsOpenMobileMenu(false);
   };

   return (
      <>
         <header className={`w-full ${styles.container}`}>
            <div className="max-w-[1240px] mx-auto w-full flex items-center justify-between">
               <div className='flex items-center gap-10'>
                  <Link href="/" className="flex items-center space-x-2">
                  <div className="relative">
                     <Image
                        src={variant === 'faq' || variant === 'about-us' ? '/assets/logo.svg' : '/assets/white-logo.svg'}
                        alt="ExchangGo 24 Logo"
                        width={190}
                        height={41.05}
                        className='sm:w-[190px] w-[160px]'
                     />
                  </div>
               </Link>

               <nav className="hidden lg:flex items-center justify-between gap-4">
                  {navItems.map((item) => (
                     <Link
                        key={item.label}
                        href={item.href}
                        className={`${styles.text} text-[11px] xl:text-[16px] font-normal leading-[22px]`}
                     >
                        {item.label}
                     </Link>
                  ))}
               </nav>
               </div>

               <div className="flex items-center">
                  <Link href='/login' className={`hidden lg:flex items-center justify-center text-[#3BEE5C] font-dm-sans text-[16px] font-medium leading-[22px] h-[46px] px-3 xl:px-6 rounded-md transition duration-300 cursor-pointer  ${styles.button}`}>
                     Exchange office Space
                  </Link>

                  <button className="lg:hidden cursor-pointer" onClick={() => setIsOpenMobileMenu((e) => !e)}>
                     <svg
                        className={`w-6 h-6 ${styles.text}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M4 6h16M4 12h16M4 18h16"
                        />
                     </svg>
                  </button>
               </div>
            </div>
         </header>

         {isOpenMobileMenu && (
            <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={closeMenu}></div>
         )}

         <div className={`fixed top-0 right-0 py-6 px-5 h-full w-[296px] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${styles.mobileMenu} ${isOpenMobileMenu ? 'translate-x-0' : 'translate-x-full'}`}>

            <div className="mb-4 flex items-center justify-between py-2">
               <Link href='/'>
                  <Image
                     src='/assets/logo.svg'
                     alt='logo'
                     width={144}
                     height={31}
                  />
               </Link>
               <button onClick={closeMenu} aria-label="Close menu">
                  <Image
                     src='/assets/close-modal.svg'
                     alt='close'
                     width={24}
                     height={24}
                  />
               </button>
            </div>

            <div className="">
               {navItems.map((item) => (
                  <Link
                     key={item.label}
                     href={item.href}
                     onClick={handleMobileMenuItemClick}
                     className="block py-2.5 text-[#585858] text-[14px] leading-[20px] font-normal"
                  >
                     {item.label}
                  </Link>
               ))}
            </div>

            <Link href='/login' className={`mt-4 flex items-center justify-center lg:hidden h-[46px] w-full px-6 rounded-md text-[16px] leading-[22px] font-medium cursor-pointer transition duration-300 ${styles.mobileButton}`}>
               Exchange office Space
            </Link>
         </div>
      </>
   );
};

export const LandingHeader: React.FC = () => <Header variant="landing" />;
export const FAQHeader: React.FC = () => <Header variant="faq" />;
export const AboutUsHeader: React.FC = () => <Header variant="about-us" />;
export default Header;