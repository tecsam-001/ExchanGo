'use client'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

interface Partner {
    src: string;
    alt: string;
}

const Partner: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    const partners: Partner[] = [
        { src: '/assets/partners/cih.png', alt: 'razorpay' },
        { src: '/assets/partners/Attijari.png', alt: 'signum' },
        { src: '/assets/partners/bmce.png', alt: 'signet' },
        { src: '/assets/partners/grapho.svg', alt: 'grapho' },
        { src: '/assets/partners/sitemark.svg', alt: 'sitemark' },
        { src: '/assets/partners/proline.svg', alt: 'proline' },
    ];

    useEffect(() => {
        const interval: NodeJS.Timeout = setInterval(() => {
            setCurrentIndex((prevIndex: number) => (prevIndex + 1) % partners.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [partners.length]);

    return (
        <>
            <div className='pt-8 pb-6 md:py-8 w-full px-5 md:px-8'>
                <div className='max-w-[1240px] w-full mx-auto grid grid-cols-1 sm:grid-cols-2 justify-items-center grow-0 lg:grid-cols-3 gap-2 md:gap-[25px]'>
                    <div className='flex items-center gap-4'>
                        <Image
                            src='/assets/office-icon.svg'
                            alt='Real-Time Exchange Rate'
                            width={52}
                            height={52}
                            className='md:w-[52px] w-[42px]'
                        />
                        <h3 className='text-[#111111] text-[16px] sm:text-[18px] leading-[19px] sm:leading-[22px] font-bold'>
                            Real-Time Exchange Rate
                        </h3>
                    </div>
                    <div className='flex items-center gap-4'>
                        <Image
                            src='/assets/no-registration.svg'
                            alt='No registration'
                            width={52}
                            height={52}
                            className='md:w-[52px] w-[42px]'
                        />
                        <h3 className='text-[#111111] text-[16px] sm:text-[18px] leading-[19px] sm:leading-[22px] font-bold'>
                            No registration required
                        </h3>
                    </div>
                    <div className='flex items-center gap-4'>
                        <Image
                            src='/assets/finding.svg'
                            alt='100% Free to Use'
                            width={52}
                            height={52}
                            className='md:w-[52px] w-[42px]'
                        />
                        <h3 className='text-[#111111] text-[16px] sm:text-[18px] leading-[19px] sm:leading-[22px] font-bold'>
                            100% Free to Use
                        </h3>
                    </div>
                </div>
            </div>

            {/* Partners */}
            <div className='pb-6 pt-0 sm:py-6 text-center'>
                <h3 className='text-[#111111] text-[20px] leading-[24px] font-bold mb-3 sm:block hidden'>
                    Partner Exchange Offices
                </h3>
                <div className='relative w-full overflow-hidden'>
                    <div className="marquee flex items-center">
                        {[...partners, ...partners, ...partners].map((partner: Partner, index: number) => (
                            <div
                                key={index}
                                className='flex justify-center items-center min-w-[126.5px] sm:min-w-[253px] gap-1.5 sm:gap-5'
                            >
                                <Image
                                    src={partner.src}
                                    alt={partner.alt}
                                    width={253}
                                    height={100}
                                    className='opacity-70 sm:w-[253px] w-[126.5px] sm:h-[100px] h-[50px]'
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .marquee {
                    animation: marquee 30s linear infinite;
                    width: max-content;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </>
    )
}

export default Partner