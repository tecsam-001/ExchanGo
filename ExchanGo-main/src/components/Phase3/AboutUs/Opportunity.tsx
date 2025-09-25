import Image from 'next/image';
import React from 'react';

interface OpportunityItem {
    id: number;
    text: string;
}

interface OpportunitySection {
    title: string;
    items: OpportunityItem[];
}

const Opportunity: React.FC = () => {
    const opportunitySections: OpportunitySection[] = [
        {
            title: "If you want to exchange money:",
            items: [
                {
                    id: 1,
                    text: "Do not handle money"
                },
                {
                    id: 2,
                    text: "Do not rank offices"
                },
                {
                    id: 3,
                    text: "Do not impose any business model"
                }
            ]
        },
        {
            title: "If you are an exchange office:",
            items: [
                {
                    id: 1,
                    text: "You become visible at the right moment"
                },
                {
                    id: 2,
                    text: "You attract already qualified customer"
                },
                {
                    id: 3,
                    text: "You maintain 100% control over your teams"
                }
            ]
        }
    ];

    return (
        <div className='pb-20 pt-0 md:py-[120px] max-w-[1260px] mx-auto flex items-center justify-between px-5 lg:flex-row flex-col-reverse'>
            <div className='lg:max-w-[608px] w-full'>
                <h4 className='text-[#20523C] text-[16px] leading-[16px] font-medium'>Opportunity</h4>
                <h1 className='text-[#000000] text-[25px] sm:text-[32px] leading-[32px] sm:leading-[38px] font-bold mt-3 sm:mt-4 mb-6 sm:mb-8'>
                    What's change for you
                </h1>
                <p className='text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal lg:max-w-[430px] w-full'>
                    The expectations are clear. Exchango24 provides the missing tool.
                </p>

                {opportunitySections.map((section, sectionIndex) => (
                    <ul key={sectionIndex} className={sectionIndex === 0 ? 'my-6 sm:my-8 space-y-3 sm:space-y-4' : 'space-y-3 sm:space-y-4'}>
                        <h3 className='text-[#000000] text-[16px] sm:text-[18px] font-bold leading-[22px] sm:leading-[25px]'>
                            {section.title}
                        </h3>
                        {section.items.map((item) => (
                            <li
                                key={item.id}
                                className='flex items-start gap-3 sm:gap-4 text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal'
                            >
                                <Image
                                    src='/assets/checkbox-icon.svg'
                                    alt='checkbox'
                                    width={24}
                                    height={24}
                                    className='sm:w-[24px] w-[18px]'
                                />
                                {item.text}
                            </li>
                        ))}
                    </ul>
                ))}
            </div>
            <div className='-mr-5 xl:-mr-10 overflow-hidden'>
                <Image
                    src='/assets/opportunity-image.png'
                    alt='opportunity'
                    width={550}
                    height={550}
                />
            </div>
        </div>
    );
};

export default Opportunity;