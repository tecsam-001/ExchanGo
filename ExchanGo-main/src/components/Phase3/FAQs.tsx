"use client"
import React, { useState } from 'react'
import Image from 'next/image'

interface IFAQsProps {
  question: string
  answer: string
}

const faqs: IFAQsProps[] = [
  {
    question: 'Am I required to update my rates daily?',
    answer: 'No, you are free to publish your rates as frequently as you wish. Even a stable rate displayed over several days improves your visibility',
  },
  {
    question: 'What happens if another office displays a lower rate than mine?',
    answer: "Exchango24 isn't a race to the bottom. Customers also choose based on proximity, trust, and service quality. Your visibility matters as much as your rate.",
  },
  {
    question: 'Must I reserve specific cash amounts for Exchango24 customers?',
    answer: 'As with any transaction, you should have sufficient cash available for exchanges. Exchango24 imposes no additional cash reservation or guarantee requirement for platform customers.',
  },
  {
    question: 'Can I withdraw from the platform at any time?',
    answer: 'Yes, you can deactivate or delete your listing whenever you wish, without fees or justification.',
  },
  {
    question: 'Do I need to create a complicated account or install an app?',
    answer: 'No. Managing your rates is done simply from a secure web interface, accessible via phone or computer.',
  },
  {
    question: 'How can I be sure customers will actually come?',
    answer: 'Exchango24 attracts thousands of daily users actively seeking exchange offices around them. Your visibility increases your chances of attracting qualified customers.',
  },
];

const FAQsSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <div className='relative w-full pt-16 sm:pt-[80px] pb-16 sm:pb-20 lg:pb-[140px] px-5'>
      <Image src="/assets/faq-vector.svg" alt='faq-vector' width={600} height={600} className='z-[-10] absolute top-[138px] right-0' />
      <div className='w-full max-w-[910px] mx-auto z-[10]'>
        <div className='text-center mb-8'>
          <span className='text-[#20523C] text-[16px] leading-[16px] font-medium mb-2.5'>FAQ</span>
          <h2 className='text-[#111111] text-[25px] leading-[32px] sm:text-[32px] font-bold sm:leading-[40px] mb-4'>Your Frequent Questions</h2>
          <p className='text-[#585858] text-[16px] sm:text-[18px] font-normal leading-[22px] sm:leading-[25px]'>These are the most commantly asked questions about ExchangeGo 24</p>
        </div>
        <div className='space-y-[24px]'>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="px-6 sm:px-[42px] py-5 sm:py-[38px] rounded-xl sm:rounded-[24px] cursor-pointer bg-[#ffffff] transition-all duration-300 ease-in-out hover:shadow-lg"
                onClick={() => toggle(index)}
                style={{
                  boxShadow: '0px 10px 32px 0px #00000014, 0px 4px 4px 0px #00000014'
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[16px] sm:text-[20px] leading-[20px] sm:leading-[24px] font-medium text-[#111111]">{faq.question}</h3>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={`transition-transform duration-300 ease-in-out flex-shrink-0 sm:w-[24px] w-[20px] ${isOpen ? '' : 'rotate-180'}`}
                  >
                    <path
                      d="M19.9181 15.0498L13.3981 8.52977C12.6281 7.75977 11.3681 7.75977 10.5981 8.52977L4.07812 15.0498"
                      stroke="#292D32"
                      strokeWidth="1.52072"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[200px] opacity-100 mt-[10px]' : 'max-h-0 opacity-0'
                    }`}
                >
                  <div className="">
                    <p className='text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal text-[#585858]'>{faq.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default FAQsSection