import Image from 'next/image'
import React from 'react'

const TrendsChart = () => {
     return (
          <div className='border border-[#DEDEDE] rounded-lg bg-white p-4' style={{ boxShadow: "0px 1px 1px 0px #0000000F" }}>
               <h3 className='text-[#111111] text-[16px] leading-[19px] font-bold mb-[18px]'>Trends</h3>
               <Image src='/assets/bar-area.svg' alt='bar-area' width={744} height={144} className='min-h-[120px] object-cover' />
               <div className='w-full max-w-[662px] mx-auto mt-3 flex items-center justify-between gap-4'>
                    <h2 className='text-[#585858] text-[12px] font-normal leading-[17px]'>Mon</h2>
                    <h2 className='text-[#585858] text-[12px] font-normal leading-[17px]'>Tue</h2>
                    <h2 className='text-[#585858] text-[12px] font-normal leading-[17px]'>Wed</h2>
                    <h2 className='text-[#585858] text-[12px] font-normal leading-[17px]'>Thu</h2>
                    <h2 className='text-[#585858] text-[12px] font-normal leading-[17px]'>Fri</h2>
                    <h2 className='text-[#585858] text-[12px] font-normal leading-[17px]'>Sat</h2>
                    <h2 className='text-[#585858] text-[12px] font-normal leading-[17px]'>Sun</h2>
               </div>
          </div>
     )
}

export default TrendsChart