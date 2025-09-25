"use client"
import React, { useState } from 'react'
import Image from 'next/image'

interface TestimonialProps {
  name: string
  image: string
  review: any
  location: string
}

const testimonials: TestimonialProps[] = [
  {
    name: "Partner exchange office",
    image: "/assets/avatar.svg",
    review: "Customers arrive already convinced. Less talking, straight to the essentials",
    location: "Rabat",
  },
  {
    name: "An MRE customer",
    image: "/assets/avatar.svg",
    review: "I saw you on Exchango24. Your rate was 11.02, right?",
    location: "Hassan II branch, Casablanca",
  },
  {
    name: "Tourist User",
    image: "/assets/avatar.svg",
    review: "Seamless experience, great rates, and helpful staff.",
    location: "Marrakech",
  },
]

const TestimonialSection = () => {

  const [index, setIndex] = useState(0)

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % testimonials.length)
  }

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className='w-full py-14 sm:py-20 lg:py-[140px] px-5'>
      <div className='w-full max-w-[1240px] mx-auto' >
        <div className='flex items-start flex-col lg:flex-row justify-between gap-8 lg:gap-4'>

          <div className='w-full lg:max-w-[450px]'>
            <h4 className='text-[#20523C] text-[16px] leading-[16px] font-medium'>What Our Users Say</h4>
            <h2 className='text-[#111111] text-[25px] sm:text-[32px] font-bold leading-[32px] sm:leading-[38px] my-2.5'>Genuine Testimonials from Our Users</h2>
            <p className='text-[#585858] text-[18px] leading-[25px] max-w-[397px]'>We ensure fast, secure, and hassle-free exchanges. Here's what our users say</p>
          </div>

          <div className='w-full lg:max-w-[608px]'>
            <p className='text-[#111111] text-[25px] sm:text-[32px] leading-[32px] sm:leading-[38px]'>" {testimonials[index].review} "</p>
            <div className='h-[1px] bg-[#DEDEDE] my-7 sm:my-[42px]' />
            <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center justify-between '>
              <div className='flex items-center gap-4'>
                <Image src={testimonials[index].image} alt='profile' width={54} height={54} className='rounded-full border border-[#DEDEDE]' />
                <div>
                  <p className='text-[#111111] text-[18px] sm:text-[20px] leading-[24px] font-medium'>{testimonials[index].name}</p>
                  <p className='text-[#111111] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal mt-[5px]'>{testimonials[index].location} </p>
                </div>
              </div>
              <div className='flex items-center justify-center gap-2.5 self-end'>
                <div onClick={handlePrev} className='w-[40px] sm:w-[54px] h-[40px] sm:h-[54px] flex items-center justify-center border-[1px] border-[#DEDEDE] rounded-full cursor-pointer hover:bg-[#f5f5f5] active:bg-[#f8f8f8] select-none'>
                  <Image src='/assets/arrow-left.svg' alt='Arrow Left' width={18} height={18} />
                </div>
                <div onClick={handleNext} className='w-[40px] sm:w-[54px] h-[40px] sm:h-[54px] flex items-center justify-center border-[1px] border-[#DEDEDE] rounded-full cursor-pointer hover:bg-[#f5f5f5] active:bg-[#f8f8f8] select-none'>
                  <Image src="/assets/new-arrow-right.svg" alt='Arrow Right' width={18} height={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestimonialSection