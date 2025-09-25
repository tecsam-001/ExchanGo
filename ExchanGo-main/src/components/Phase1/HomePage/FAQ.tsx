'use client'
import Image from 'next/image'
import React, { useState } from 'react'
interface FAQItem {
    id: number
    question: string
    answer: string
}
const FAQ: React.FC = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(1)
    const faqData: FAQItem[] = [
        {
            id: 1,
            question: "Are the displayed rates up-to-date and reliable?",
            answer: "Yes, all rates displayed on ExchangeGo24 are updated in real-time and sourced directly from partner exchange offices. We ensure accuracy by refreshing rates every few minutes to reflect current market conditions."
        },
        {
            id: 2,
            question: "Are there any additional fees?",
            answer: "No hidden fees are charged by ExchangeGo24. The rate displayed is exactly what the exchange office provides. If any fees apply on-site, they will be clearly indicated in the bureau's profile."
        },
        {
            id: 3,
            question: "Can I negotiate the rate on-site?",
            answer: "While rates are generally fixed as displayed, some exchange offices may offer flexibility for larger amounts. We recommend checking with the specific bureau beforehand or looking for offices that explicitly mention negotiable rates."
        },
        {
            id: 4,
            question: "How often are the rates updated?",
            answer: "Our rates are updated every 2-5 minutes during business hours to ensure you always see the most current exchange rates. This frequent updating helps you make informed decisions and get the best value for your money."
        },
        {
            id: 5,
            question: "Can I see exchange offices near me?",
            answer: "Absolutely! Simply enter your location and the currencies you want to exchange. Our platform will show you all nearby exchange offices with their current rates, allowing you to compare and choose the best option."
        }
    ]
    const toggleFAQ = (faqId: number) => {
        setOpenFAQ(prev => (prev === faqId ? null : faqId))
    }
    return (
        <div className='py-20 md:pt-[150px] md:pb-[120px] relative h-auto overflow-hidden'>
            <Image src='/assets/faq-arrows-bg.svg' alt='arrows' width={600} height={700} className='absolute right-0 bottom-10 md:block hidden' />
            <div className='max-w-[910px] mx-auto w-full relative z-40 px-4'>
                <div className='text-center'>
                    <h4 className='text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium'>
                        Ask us Anything
                    </h4>
                    <h1 className='text-[#111111] text-[24px] sm:text-[32px] leading-[29px] sm:leading-[38px] font-bold mt-2 sm:mt-2.5 mb-4'>
                        Frequently Asked Questions
                    </h1>
                    <p className='text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal max-w-[600px] mx-auto'>
                        These are the most commonly asked questions about ExchangeGo 24
                    </p>
                </div>
                {/* FAQ */}
                <div className='mt-6 md:mt-8 space-y-4 md:space-y-6'>
                    {faqData.map((faq) => (
                        <div
                            key={faq.id}
                            onClick={() => toggleFAQ(faq.id)}
                            className={`p-6 md:px-[42px] md:py-[38px] bg-white rounded-[16px] md:rounded-[24px] w-full transition-all duration-500 ease-in-out cursor-pointer ${openFAQ === faq.id
                                ? 'shadow-[0px_20px_32px_0px_#00000014] border border-transparent'
                                : 'border border-[#DEDEDE] hover:shadow-[0px_8px_16px_0px_#00000008]'
                                }`}
                        >
                            <div className='flex items-center justify-between gap-4'>
                                <h3 className='text-[#111111] text-[14px] md:text-[20px] leading-[20px] md:leading-[24px] font-medium'>
                                    {faq.question}
                                </h3>
                                <div
                                    className='flex-shrink-0 transition-all duration-500 ease-in-out hover:scale-110'
                                    style={{
                                        transform: openFAQ === faq.id ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }}
                                >
                                    <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M20.8595 9.07227L14.2495 15.6823C13.4689 16.4629 12.1915 16.4629 11.4108 15.6823L4.80078 9.07227" stroke="#292D32" strokeWidth="1.52072" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out origin-top ${openFAQ === faq.id
                                    ? 'max-h-96 opacity-100 transform scale-y-100'
                                    : 'max-h-0 opacity-0 transform scale-y-0'
                                    }`}
                            >
                                <div className='pt-2.5'>
                                    <p className='text-[#585858] text-[14px] md:text-[18px] leading-[20px] md:leading-[25px] font-normal'>
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default FAQ