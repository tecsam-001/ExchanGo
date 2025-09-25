"use client"
import React from 'react'
import Image from 'next/image'
import Header from '@/components/Phase3/Header'
import GradientButton from '../ui/GradientButton'
import { useRouter } from 'next/navigation' 

const HeroSection = () => {
  const features = [
    'No Subscriptions',
    'No Commitment',
    'You stay in control'
  ]

  const router = useRouter() 

  return (
    <div className='w-full relative overflow-hidden' style={{ background: "url(/assets/home-bg.svg)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
        <Header />
      <div className='pl-5'>
        <div className='flex items-center flex-col'>
          <div className='w-full max-w-[1240px] mx-auto'>
            <div className='flex items-start'>
              <div className='lg:max-w-[550px] pb-14 sm:pb-[80px] lg:pb-[119px] relative z-30 pr-5 lg:pr-0'>
                <h4 className='text-[#3BEE5C] text-[16px] leading-[16px] font-bold mb-2.5'>EXCHNAGEGO24</h4>
                <h1 className='font-bold text-[30px] sm:text-[52px] leading-[35px] sm:leading-[62px] text-[#FFFFFF] mb-4 sm:mb-6'>Your Digital  Showcase, No Strings Attached</h1>
                <p className='text-[#FEFEFE] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal mb-4 lg:max-w-[503px]'>A simple, independent platform to display your daily exchange rates and become visible to  thousands of customers looking to exchange their money around you</p>
                <p className='text-[#FEFEFE] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal lg:max-w-[503px]'>Today, customers compare before they move.  Exchango24 makes you visible at the right time, displaying your updated rates clearly on a  reliable map.</p>

                <div className='mt-6 flex flex-col gap-[16px]'>
                  {features.map((feature, index) => (
                    <div key={index} className='flex items-center gap-2 sm:gap-4'>
                      <Image
                        src='/assets/checkbox-home.svg'
                        alt='checkbox'
                        width={24}
                        height={24}
                        className='sm:w-[24px] w-[18px]'
                      />
                      <p className='text-[#FEFEFE] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal'>{feature}</p>
                    </div>
                  ))}
                </div>
                <GradientButton
                  className='mt-6'
                  onClick={() => router.push('/login')}
                >
                  Register my currency exchange
                </GradientButton>
              </div>
            </div>
          </div>
          <div className='w-full flex items-end justify-end lg:absolute -bottom-6 right-0 ml-24'>
            <div className='relative'>
              <Image src="/assets/home-hero-desktop.webp" alt='desktop version' width={600} height={700} />
              <Image src="/assets/iPhone-13-Pro-Front.png" alt='iPhone-13-Pro-Front' width={230} height={308} className='sm:w-[230px] w-[160px] absolute bottom-0 lg:bottom-6 -left-14' />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection