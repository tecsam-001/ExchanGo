import Image from 'next/image'
import React from 'react'

interface Feature {
    id: string
    imageSrc: string
    title: string
    description: string
}

const featuresData: Feature[] = [
    {
        id: 'real-time-rate-comparison',
        imageSrc: '/assets/real-time-rate-comparison.svg',
        title: 'Real-Time Rate Comparison',
        description: 'Compare exchange rates from multiple money changers in one view.'
    },
    {
        id: 'pick-your-ideal-exchange',
        imageSrc: '/assets/pick-your-ideal-exchange.svg',
        title: 'Pick Your Ideal Exchange',
        description: 'Pick the best option based on rate, location, and user feedback.'
    },
    {
        id: 'start-your-journey',
        imageSrc: '/assets/start-your-journey.svg',
        title: 'Start Your Journey',
        description: 'Head directly to your chosen destination that fits your needs.'
    }
]

const TheBestReasons: React.FC = () => {
    return (
        <div className='px-5 md:px-8'>
            <div className='pt-8 sm:pt-10 pb-[57px] md:pb-20 max-w-[1142px] mx-auto w-full flex items-center justify-between lg:flex-row flex-col-reverse gap-11 lg:gap-4'>
                <div className='lg:max-w-[454px] w-full lg:text-left text-center'>
                    <h4 className='text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium'>The Best Reasons to</h4>
                    <h1 className='text-[#111111] text-[24px] sm:text-[32px] leading-[29px] sm:leading-[38px] font-bold mt-2 sm:mt-2.5 mb-4'>Rely on Us for Transparent Exchange</h1>
                    <p className='text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal max-w-[600px] lg:max-w-[350px] mx-auto lg:mx-0'>Searching for a great rate shouldn't be stressful. ExchanGo24 gives you a clear, instant view of all your options nearby.</p>
                    <div className='mt-6 space-y-6 text-left'>
                        {featuresData.map((feature) => (
                            <div key={feature.id} className='flex items-start gap-4 sm:gap-7'>
                                <Image src={feature.imageSrc} alt={feature.title} width={64.44} height={64.44} className='sm:w-[64.44px] w-[54.36px]'/>
                                <div>
                                    <h3 className='text-[#111111] text-[14px] sm:text-[20px] leading-[17px] sm:leading-[24px] font-bold'>{feature.title}</h3>
                                    <p className='text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal mt-1'>{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='relative md:block hidden lg:overflow-hidden xl:overflow-visible'>
                    <Image src='/assets/the-best-reasons-to.png' alt='the-best-reasons-to' width={559} height={644} />
                    <Image src='/assets/card.png' alt='card' width={245} height={332} draggable='false' className='absolute top-[135px] -right-[53px] overflow-hidden' style={{boxShadow: "0px 25.09px 100.36px 0px #00000029"}} />
                </div>
                <Image src='/assets/the-best-reasons-to-mobile.webp' alt='the-best-reasons-to' width={335} height={322} className='md:hidden block w-full' />
            </div>
        </div>
    )
}

export default TheBestReasons