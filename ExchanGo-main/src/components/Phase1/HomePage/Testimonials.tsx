'use client'
import Image from 'next/image'
import React, { useState } from 'react'

interface Testimonial {
    id: number
    text: string
    name: string
    location: string
    profileImage: string
}

const Testimonials: React.FC = () => {
    const [hoveredCard, setHoveredCard] = useState<number>(1) 

    const testimonialsData: Testimonial[] = [
        {
            id: 1,
            text: "I compared exchange rates in Casablanca even before leaving the airport. I saved 300 MAD",
            name: "Youssef",
            location: "MRE (France)",
            profileImage: "/assets/profile-testi.svg"
        },
        {
            id: 2,
            text: "I exchange large amounts every month. With Exchango24, I always know exactly where to go, saving me a lot of time",
            name: "Hachimi ",
            location: "Enterpreneur",
            profileImage: "/assets/profile-testi.svg"
        },
        {
            id: 3,
            text: "I avoided an exchange office that charged a 5% commission. Thanks to the map, I found a better option just 300 meters away",
            name: "Elodie ",
            location: "Tourist",
            profileImage: "/assets/profile-testi.svg"
        }
    ]

    const handleCardHover = (cardId: number) => {
        setHoveredCard(cardId)
    }

    return (
        <div className='md:px-8 px-5 w-full bg-[#F6F6F6] relative py-20 lg:py-[140px] md:block hidden overflow-hidden'>
            <Image src='/assets/testimonials-bg.svg' alt='arrows' width={700} height={800} className='absolute left-0 top-[33px]' />
            <div className='max-w-[1142px] mx-auto w-full'>
                <div className='sm:text-left text-center'>
                    <h3 className='text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium'>
                        What Our Users Say
                    </h3>
                    <h1 className='text-[24px] sm:text-[32px] text-[#111111] leading-[29px] sm:leading-[38px] font-bold mb-4 sm:mb-2 mt-2 sm:mt-2.5'>
                        Genuine Testimonials from Our Users
                    </h1>
                    <p className='text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal'>
                        We ensure fast, secure, and hassle-free exchanges. Here's what our users say.
                    </p>
                </div>

                <div className='mt-10 grid grid-cols-3 gap-3 lg:gap-6'>
                    {testimonialsData.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className={`px-5 lg:px-8 py-6 lg:py-[42px] rounded-[16px] relative overflow-hidden transition-all duration-300 cursor-pointer ${hoveredCard === testimonial.id
                                    ? 'bg-[#C0ED81] border border-white/50'
                                    : 'bg-[#FFFFFF] border border-transparent'
                                }`}
                            style={{ boxShadow: '0px 32px 80px 0px #0000001A' }}
                            onMouseEnter={() => handleCardHover(testimonial.id)}
                        >
                            <Image
                                src='/assets/ornament.svg'
                                alt='ornament'
                                width={350}
                                height={413}
                                className={`absolute bottom-0 left-10 w-full transition-opacity duration-300 ease-in-out ${hoveredCard === testimonial.id ? 'opacity-100' : 'opacity-0'
                                    }`}
                            />

                            <div className='h-full flex flex-col justify-between items-start relative gap-[168px] z-40'>
                                <h2 className='text-[#111111] text-[20px] lg:text-[26px] leading-[25px] lg:leading-[31px] font-normal'>
                                    {testimonial.text}
                                </h2>
                                <div className='flex items-center gap-3 lg:gap-4'>
                                    <Image
                                        src={testimonial.profileImage}
                                        alt='profile'
                                        width={62}
                                        height={62}
                                    />
                                    <div>
                                        <h4 className='text-[#111111] text-[20px] leading-[24px] font-medium'>
                                            {testimonial.name}
                                        </h4>
                                        <h4 className='text-[#111111] text-[18px] leading-[25px] font-normal mt-[5px]'>
                                            {testimonial.location}
                                        </h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Testimonials