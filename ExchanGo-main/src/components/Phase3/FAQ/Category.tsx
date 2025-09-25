'use client';
import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

interface FAQCategory {
    id: string;
    label: string;
    icon: string;
    faqs: FAQItem[];
}

interface FAQData {
    individual: FAQCategory[];
    exchange: FAQCategory[];
}

const faqData: FAQData = {
    individual: [
        {
            id: 'service-usage',
            label: 'Service usage',
            icon: '/assets/security-user.svg',
            faqs: [
                {
                    id: 'ind-su-1',
                    question: 'How does Exchango24 work?',
                    answer: 'Exchango24 allows you to compare real-time exchange rates offered by nearby exchange offices. Within seconds, you can see nearby offices, their rates, opening hours, and contact details, then choose the best option. You don\'t exchange online—you visit the physical office armed with accurate information.'
                },
                {
                    id: 'ind-su-2',
                    question: 'Do I need to create an account to use the service?',
                    answer: 'No. No registration is required. You can freely compare rates without logging in or providing personal information.'
                },
                {
                    id: 'ind-su-3',
                    question: 'Is it really free?',
                    answer: 'Yes, Exchango24 is completely free for users. No subscription fees, hidden charges, or commissions. You view, compare, and choose without ever paying.'
                },
                {
                    id: 'ind-su-4',
                    question: 'How do I find the best exchange rate?',
                    answer: 'Simply enter the currency you want to exchange and your location on our homepage. We will show you a list of nearby exchange offices with their current rates, allowing you to easily compare and choose the best deal.'
                }
            ]
        },
        {
            id: 'rate-reliability',
            label: 'Rate & Reliability',
            icon: '/assets/dollar-square.svg',
            faqs: [
                {
                    id: 'ind-rr-1',
                    question: 'How reliable are the exchange rates?',
                    answer: 'Our rates are updated in real-time and sourced directly from partner exchange offices. We ensure accuracy by constantly monitoring and verifying the data to provide you with the most current information available.'
                },
                { id: 'ind-rr-2', question: 'How often are the rates updated?', answer: 'Rates are updated every few minutes to ensure you have the most current information for your transactions.' },
                { id: 'ind-rr-3', question: 'Are there any hidden fees?', answer: 'No, ExchanGo24 is transparent. The rate you see is the rate you get. We don\'t add any commission or hidden charges.' },
                { id: 'ind-rr-4', question: 'Can I set a rate alert?', answer: 'Yes, our "Rate Alert" feature notifies you when your desired exchange rate is available, ensuring you never miss a good deal.' },
            ]
        },
        {
            id: 'practical-cases',
            label: 'Practical Cases',
            icon: '/assets/book.svg',
            faqs: [
                { id: 'ind-pc-1', question: 'I am a tourist, how can ExchanGo24 help me?', answer: 'As a tourist, you can save money by finding the best exchange rates for your currency. Our platform helps you avoid unfavorable rates at airports or hotels.' },
                { id: 'ind-pc-2', question: 'I am an international student, what are the benefits?', answer: 'International students can manage their finances better by exchanging money at the most favorable rates, helping their student budget stretch further.' },
                { id: 'ind-pc-3', question: 'Can I use this for a large transaction?', answer: 'Yes, you can. For large transactions, we recommend contacting the exchange office beforehand to ensure they have sufficient liquidity.' },
                { id: 'ind-pc-4', question: 'What do I need to bring to the exchange office?', answer: 'Typically, you will need a valid ID (like a passport) for transactions, especially for larger amounts. It\'s best to check with the specific office.' },
            ]
        },
        {
            id: 'security-privacy',
            label: 'Security & Privacy',
            icon: '/assets/briefcase.svg',
            faqs: [
                {
                    id: 'ind-sp-1',
                    question: 'How secure is my data?',
                    answer: 'We take your privacy seriously. Since no registration is required, we collect minimal data. Any information processed is encrypted and handled according to strict privacy standards to ensure your security.'
                },
                { id: 'ind-sp-2', question: 'Why don\'t I need to register?', answer: 'Our goal is to provide a quick and hassle-free service. No registration means you can get the information you need instantly.' },
                { id: 'ind-sp-3', question: 'Are the exchange offices listed trustworthy?', answer: 'We partner with reputable and licensed exchange offices. However, we always recommend you do your own due diligence.' },
                { id: 'ind-sp-4', question: 'What should I do if I have a problem with an office?', answer: 'While we are a comparison platform, we take feedback seriously. Please contact our support with any issues, and we will investigate.' },
            ]
        }
    ],
    exchange: [
        {
            id: 'service-usage',
            label: 'Service usage',
            icon: '/assets/security-user.svg',
            faqs: [
                { id: 'ex-su-1', question: 'How can my exchange office join ExchanGo24?', answer: 'You can register your interest by visiting our "Join Us" page. Our team will review your application and guide you through the onboarding process.' },
                { id: 'ex-su-2', question: 'What are the requirements to be listed?', answer: 'Exchange offices must be licensed, have a physical location, and agree to our terms of service, which includes providing real-time rate updates.' },
                { id: 'ex-su-3', question: 'How do I manage my office\'s information?', answer: 'You will get access to a dedicated dashboard where you can update your rates, opening hours, and contact details.' },
                { id: 'ex-su-4', question: 'Is there a dashboard for exchange offices?', answer: 'Yes, all our partners get access to a comprehensive dashboard to manage their listing and view performance analytics.' },
            ]
        },
        {
            id: 'rate-reliability',
            label: 'Rate & Reliability',
            icon: '/assets/dollar-square.svg',
            faqs: [
                { id: 'ex-rr-1', question: 'How do I update my exchange rates on the platform?', answer: 'You can update your rates manually through your office dashboard or automate the process using our API.' },
                { id: 'ex-rr-2', question: 'Can I sync my rates automatically?', answer: 'Yes, we provide API access for automatic rate synchronization to ensure your listing is always up-to-date with minimal effort.' },
                { id: 'ex-rr-3', question: 'What happens if I forget to update my rates?', answer: 'Outdated rates can lead to a poor user experience. Our system will send you reminders, and if rates are not updated, your listing may be temporarily paused.' },
                { id: 'ex-rr-4', question: 'How do you ensure rate accuracy for partners?', answer: 'We use a combination of automated checks and user feedback to ensure the rates displayed are accurate. We work closely with our partners to maintain data integrity.' },
            ]
        },
        {
            id: 'practical-cases',
            label: 'Practical Cases',
            icon: '/assets/book.svg',
            faqs: [
                { id: 'ex-pc-1', question: 'How does ExchanGo24 help me get more customers?', answer: 'By listing on our platform, you gain visibility to a large audience of users actively looking for currency exchange services, driving more foot traffic to your office.' },
                { id: 'ex-pc-2', question: 'Can I see analytics about my office\'s performance?', answer: 'Yes, your dashboard includes analytics on how many users have viewed your listing, requested directions, and other key performance indicators.' },
                { id: 'ex-pc-3', question: 'What are the best practices for a successful listing?', answer: 'Keeping your rates competitive and your information up-to-date are key. Engaging with user reviews and offering excellent customer service also helps.' },
                { id: 'ex-pc-4', question: 'How do we handle customer complaints through the platform?', answer: 'We facilitate communication but encourage direct resolution. Our support team is available to mediate if necessary to ensure a fair outcome.' },
            ]
        },
        {
            id: 'security-privacy',
            label: 'Security & Privacy',
            icon: '/assets/briefcase.svg',
            faqs: [
                { id: 'ex-sp-1', question: 'What data do you collect from exchange offices?', answer: 'We collect business information required for the listing, such as your office name, address, contact details, and exchange rates.' },
                { id: 'ex-sp-2', question: 'How is our business information protected?', answer: 'All data is stored securely and handled with strict confidentiality. We do not share your private business data without your consent.' },
                { id: 'ex-sp-3', question: 'What are the terms of service for partner offices?', answer: 'Our terms of service outline the responsibilities of both parties, covering aspects like rate accuracy, service standards, and data privacy. You can review them during onboarding.' },
                { id: 'ex-sp-4', question: 'Who can I contact for partnership-related security questions?', answer: 'You can reach out to our dedicated partnership support team. Contact details are provided in your dashboard.' },
            ]
        }
    ]
};

interface CategoryProps {
    faqType: 'individual' | 'exchange';
}

const Category: React.FC<CategoryProps> = ({ faqType }) => {
    const [activeCategory, setActiveCategory] = useState<string>('service-usage');
    const [openFAQ, setOpenFAQ] = useState<string | null>(null);

    useEffect(() => {
        setActiveCategory('service-usage');
        setOpenFAQ(null);
    }, [faqType]);

    const categories = faqData[faqType];
    const activeFAQData = categories.find(c => c.id === activeCategory)?.faqs || [];

    const toggleFAQ = (id: string) => {
        setOpenFAQ(prev => (prev === id ? null : id));
    };

    const handleCategoryClick = (categoryId: string) => {
        setActiveCategory(categoryId);
    };

    return (
        <div className='px-5 w-full'>
            <div className='max-w-[1240px] mx-auto w-full pt-16 sm:pt-[98px] pb-10 sm:pb-20'>
                <div className='flex md:flex-row flex-col gap-6'>
                    <div className='w-full md:w-[220px] lg:w-[292px] flex-shrink-0'>
                        <div className='sticky top-8'>
                            <div className='overflow-hidden'>
                                <h2 className='pl-4 text-[#000000] text-[18px] leading-[22px] font-bold'>Category</h2>
                                <div className='mt-4 space-y-2'>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryClick(category.id)}
                                            className={`w-full cursor-pointer flex items-center gap-3.5 px-4 h-[54px] text-left rounded-lg transition-all duration-300 hover:bg-[#F1F1F1] text-[#111111] ${activeCategory === category.id
                                                ? 'bg-[#F1F1F1]'
                                                : ''
                                                }`}
                                        >
                                            <Image src={category.icon} alt='icon' width={24} height={24} />
                                            <span className='text-[16px] leading-[19px] font-normal'>
                                                {category.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Main Content */}
                    <div className='flex-1' id='faq-section'>
                        <div className='space-y-4 sm:space-y-6'>
                            {activeFAQData.map((faq) => (
                                <div
                                    key={faq.id}
                                    className='bg-white rounded-xl sm:rounded-[24px] overflow-hidden transition-all duration-300'
                                    style={{
                                        boxShadow: '0px 10px 32px 0px #00000014, 0px 4px 4px 0px #00000014'
                                    }}
                                >
                                    <button
                                        onClick={() => toggleFAQ(faq.id)}
                                        className={`w-full px-6 sm:px-[42px] py-5 sm:pt-[38px] text-left flex items-center gap-4 cursor-pointer justify-between transition-all duration-300 ${openFAQ === faq.id ? 'pb-2.5' : 'pb-5 sm:pb-[38px]'}`}
                                    >
                                        <h3 className='text-[16px] sm:text-[20px] leading-[20px] sm:leading-[24px] font-medium text-[#111111]'>
                                            {faq.question}
                                        </h3>
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className={`transition-transform duration-300 ease-in-out flex-shrink-0 sm:w-[24px] w-[20px] ${openFAQ === faq.id ? '' : 'rotate-180'}`}
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
                                    </button>
                                    <div
                                        className={`px-6 sm:px-[42px] overflow-hidden transition-all duration-500 ease-in-out ${openFAQ === faq.id
                                            ? 'max-h-96 opacity-100 pb-5 sm:pb-[38px]'
                                            : 'max-h-0 opacity-0 pb-0'
                                            }`}
                                    >
                                        <p className='text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal text-[#585858]'>
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Category;