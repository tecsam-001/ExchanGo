import React from 'react'

const BenefitSection = () => {
  const leftColumnData = [
    {
      title: "You are visible when your customers are looking.",
      description: "A user opens Exchango24, sees your rate, and heads directly to you. You appear at the right moment, at the right place—with the information they need."
    },
    {
      title: "You attract new customers ready to exchange",
      description: "Some customers didn't know you. Others knew you but didn't know your offers. Thanks to Exchango24, they find you—and choose you."
    },
    {
      title: "You avoid mistakes or misunderstandings.",
      description: "When information is clear from the start, the customer can't say \"I didn't know\" or \"I thought that...\" Everything is visible, updated, and transparent."
    },
    {
      title: "You show you are in tune with the times.",
      description: "By displaying your rates, you show that you are accessible, modern, and attentive to your customers. Without losing your independence, you reinforce your image"
    },
    {
      title: "You can monitor your activity and adjust your visibility.",
      description: "Analyze trends, see when your rates attract attention, and adapt your communication."
    }
  ];

  const rightColumnData = [
    {
      title: "You save time at the counter.",
      description: "The customer arrives already informed. They don't come to \"check\"—they come to exchange. Less discussion, less tension, more efficiency."
    },
    {
      title: "You remain in control, without complexity.",
      description: "Changing a rate takes less than 10 seconds from your phone. No forms to fill out, no strict schedules. You decide."
    },
    {
      title: "You highlight your professionalism.",
      description: "Being displayed with clear rates on a platform consulted daily positions you as a professional, organized, and trustworthy exchange office."
    },
    {
      title: "You gain a professional online presence without heavy investment.",
      description: "No need for a website, agency, or technician. Your visibility is ensured by a simple, free tool."
    }
  ];

  return (
    <div className='w-full px-5' style={{ background: "url(/assets/home-bg.svg)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
      <div className='w-full py-[70px] lg:py-[120px] max-w-[1240px] mx-auto'>
        <div className='text-center mb-8 sm:mb-[42px]'>
          <h4 className='text-[#3BEE5C] text-[16px] leading-[16px] font-medium'>Our Benefit</h4>
          <h2 className='text-[#ffffff] text-[25px] sm:text-[32px] leading-[32px] sm:leading-[38px] font-bold mt-2.5 mb-2'>Benefits from day one</h2>
          <p className='text-white/60 text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal'>There are several meaningful benefits waiting for you along the way</p>
        </div>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <div>
            {leftColumnData.map((benefit, index) => (
              <div key={index} className='mb-[24px] last:mb-0'>
                <h4 className='text-[16px] sm:text-[20px] font-medium leading-[22px] sm:leading-[24px] text-[#FFFFFF] mb-2 sm:mb-2.5'>{benefit.title}</h4>
                <p className='text-white/60 text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal'>{benefit.description}</p>
              </div>
            ))}
          </div>
          <div>
            {rightColumnData.map((benefit, index) => (
              <div key={index} className='mb-[24px] last:mb-0'>
                <h4 className='text-[16px] sm:text-[20px] font-medium leading-[22px] sm:leading-[24px] text-[#FFFFFF] mb-2 sm:mb-2.5'>{benefit.title}</h4>
                <p className='text-white/60 text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal'>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BenefitSection