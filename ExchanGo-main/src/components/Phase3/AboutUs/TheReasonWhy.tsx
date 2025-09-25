import Image from 'next/image';
import React from 'react';

interface ObservationItem {
    id: number;
    text: string;
}

const TheReasonWhy: React.FC = () => {
    const observations: ObservationItem[] = [
        {
            id: 1,
            text: "You, as a traveler, investor, or expat, are looking for a reliable exchange office nearby with a good rate."
        },
        {
            id: 2,
            text: "You, as an exchange professional, offer excellent rates… but few people know it."
        }
    ];

    return (
        <div className='py-20 md:py-[120px] w-full max-w-[1260px] mx-auto flex items-center justify-between lg:flex-row flex-col gap-10 md:gap-16 px-5'>
            <div className='relative max-w-[503px] overflow-hidden sm:overflow-visible'>
                <Image
                    src='/assets/the-reason-why.png'
                    alt='profile'
                    width={503}
                    height={550}
                    className='rounded-[24px] md:min-w-[400px] lg:min-w-[500px]'
                />
                <Image
                    src='/assets/atlas-exchange.svg'
                    alt='atlas-exchange'
                    width={342}
                    height={110}
                    className='w-[250px] md:w-[342px] absolute top-5 md:top-11 -right-[35px] md:-right-[100px]'
                />
            </div>
            <div className='lg:max-w-[608px] text-left w-full'>
                <h4 className='text-[#20523C] text-[16px] font-medium leading-[16px]'>
                    The reason Why
                </h4>
                <h1 className='text-[#000000] text-[25px] sm:text-[32px] leading-[32px] sm:leading-[38px] font-bold my-3 sm:my-4'>
                    Exchango24 Exists
                </h1>
                <p className='text-[#585858] text-[16px] sm:text-[18px] font-normal leading-[22px] sm:leading-[25px] xl:max-w-[503px]'>
                    Exchanging money should be simple. Yet, people frequently waste time, hesitate, or make the wrong choice.
                </p>
                <div className='my-5 sm:my-8'>
                    <h3 className='text-[16px] sm:text-[18px] text-[#585858] leading-[22px] sm:leading-[25px] font-normal'>
                        We started with a clear observation:
                    </h3>
                    <ul className='mt-3 sm:mt-4 lg:max-w-[503px] space-y-3 sm:space-y-4'>
                        {observations.map((observation) => (
                            <li
                                key={observation.id}
                                className='flex items-start gap-3 sm:gap-4 text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal'
                            >
                                <Image
                                    src='/assets/checkbox-icon.svg'
                                    alt='checkbox'
                                    width={24}
                                    height={24}
                                    className='w-[18px] sm:w-[24px]'
                                />
                                {observation.text}
                            </li>
                        ))}
                    </ul>
                </div>
                <h4 className='text-[#585858] text-[16px] sm:text-[18px] font-normal leading-[22px] sm:leading-[25px]'>
                    We've experienced these situations ourselves.
                </h4>
                <h2 className='text-[#000000] text-[16px] sm:text-[18px] font-bold leading-[22px] sm:leading-[25px] mt-3'>
                    Exchango24 was created to simplify. To reconnect.
                </h2>
            </div>
        </div>
    );
};

export default TheReasonWhy;