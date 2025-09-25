import React from 'react'
import Image from 'next/image'

interface Reason {
  id: number
  text: string
}

const JoinUsSection: React.FC = () => {
  const reasons: Reason[] = [
    {
      id: 1,
      text: "Because customers compare before exchanging. They look for clear rates nearby without wasting time. Exchango24 shows them visible offices around them, with actual displayed rates, without intermediaries."
    },
    {
      id: 2,
      text: "Because appearing is already convincing. Being on the map reassures customers. Clearly displayed rates build trust, reduce negotiation at the counter, and attract decisive customers."
    },
    {
      id: 3,
      text: "Because you control your visibility without constraints. You publish your rates from your space in just a few seconds, as often as you wish. You maintain control over what you display, when, and how—strengthening"
    }
  ]

  return (
    <div className='w-full pt-10 pb-4 lg:py-[60px] px-5'>
      <div className='w-full max-w-[1240px] mx-auto'>
        <div className='flex flex-col-reverse lg:flex-row items-center justify-between lg:gap-6'>
          <Image
            src="/assets/offices-join-us.svg"
            alt='office join us'
            width={550}
            height={550}
          />

          <div className='w-full lg:max-w-[606px]'>
            <h2 className='text-black text-[22px] sm:text-[32px] leading-[30px] sm:leading-[38px] font-bold mb-4 sm:mb-6'>
              Why exchange offices join us:
            </h2>

            <div className='flex flex-col gap-[16px]'>
              {reasons.map((reason: Reason) => (
                <div key={reason.id} className='grid grid-cols-[24px_1fr] gap-4'>
                  <Image
                    src='/assets/checkbox-icon.svg'
                    alt='checkbox'
                    width={24}
                    height={24}
                    className='sm:w-[24px] w-[18px] mt-0.5 sm:mt-0 flex-shrink-0'
                  />
                  <p className='text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal'>
                    {reason.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JoinUsSection