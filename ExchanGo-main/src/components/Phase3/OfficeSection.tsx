'use client';
import React from 'react'
import Image from 'next/image'
import GradientButton from '../ui/GradientButton'
import { useRouter } from 'next/navigation';


const OfficeSection = () => {
  const router = useRouter();
  return (
    <div className='w-full h-full lg:h-[500px] px-5 overflow-hidden pt-10 lg:pt-0' style={{ background: "url(/assets/what-we-stand-for-bg.svg)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <div className='w-full max-w-[1240px] mx-auto h-full'>
        <div className='flex lg:items-center h-full justify-start lg:flex-row flex-col relative gap-6'>
          <div className='w-full lg:max-w-[400px] xl:max-w-[503px] flex flex-col items-start relative z-10'>
            <h2 className='text-[#ffffff] text-[25px] sm:text-[32px] font-bold leading-[32px] sm:leading-[38px] mb-3 sm:mb-4'>Are you Exchange Office ?</h2>
            <p className='text-white/60 text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal mb-4 sm:mb-6'>Join the platform for free and publish your first rate today.</p>
            <p className='text-white/60 text-[14px] leading-[20px] font-normal'>Questions? Need more information?</p>
            <p className='text-white/60 text-[14px] leading-[20px] font-normal mb-6 sm:mb-4'>Contact our team via WhatsApp.</p>

            <GradientButton onClick={() => router.push("/login")} className='h-10 sm:h-[46px]'>Create My Account</GradientButton>
          </div>

          <div className='lg:absolute top-[83px] right-16 flex items-end justify-end mr-[40px] md:mr-[100px] lg:mr-0'>
            <div className='relative'>
              <Image src='/assets/desktop-web.webp' alt='desktop' width={500} height={434} className='' />
              <Image src='/assets/mobile-web-removebg-preview.png' alt='mobile' width={230} height={308} className='md:w-[230px] w-[100px] absolute -bottom-[2px] -right-[50px] md:-right-[92px] overflow-hidden' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfficeSection