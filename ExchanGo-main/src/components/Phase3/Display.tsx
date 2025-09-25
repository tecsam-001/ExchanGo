import React from 'react'
import Image from 'next/image'

interface Feature {
  id: number
  text: string
}

const DisplaySection: React.FC = () => {
  const features: Feature[] = [
    {
      id: 1,
      text: "Your opening hours, contact information, and conditions"
    },
    {
      id: 2,
      text: "Your daily exchange rates, modifiable in less than 10 seconds"
    },
    {
      id: 3,
      text: "A professional, clear, and credible image"
    }
  ]

  return (
    <div className='w-full py-[60px] lg:py-[100px] px-5'>
      <div className='w-full max-w-[1240px] mx-auto'>
        <div className='flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-0'>
          <div className='w-full lg:max-w-[608px]'>
            <h2 className='text-black text-[22px] sm:text-[32px] leading-[30px] sm:leading-[38px] font-bold'>
              What you display:
            </h2>
            <p className='text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal my-4 sm:my-6 lg:max-w-[503px]'>
              Contains information about what users need and things that attract users to your office.
            </p>

            <div className='flex flex-col gap-4 mb-4 sm:mb-[24px]'>
              {features.map((feature: Feature) => (
                <div key={feature.id} className='flex items-start sm:items-center gap-4'>
                  <Image
                    src='/assets/checkbox-icon.svg'
                    alt='checkbox'
                    width={24}
                    height={24}
                    className='sm:w-[24px] w-[18px] mt-0.5 sm:mt-0'
                  />
                  <p className='text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal'>
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>

            <p className='text-[#585858] text-[14px] font-normal leading-[20px] max-w-[503px]'>
              You remain independent in your operations. You decide what information to display while providing a clear and reassuring experience for customers.
            </p>
          </div>

          <Image
            src='/assets/what-you-display.svg'
            alt='display image'
            width={503}
            height={550}
          />
        </div>
      </div>
    </div>
  )
}

export default DisplaySection