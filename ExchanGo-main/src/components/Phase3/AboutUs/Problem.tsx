import Image from 'next/image';
import React from 'react';

interface ProblemItem {
    id: number;
    text: string;
}

const Problem: React.FC = () => {
    const customerProblems: ProblemItem[] = [
        {
            id: 1,
            text: "Spending time searching for a decent exchange rate"
        },
        {
            id: 2,
            text: "Hesitating to enter an unknown office"
        },
        {
            id: 3,
            text: "Accepting an unclear rate due to a lack of transparent information"
        }
    ];

    const exchangeOfficeProblems: ProblemItem[] = [
        {
            id: 1,
            text: "Displaying a good rate… that nobody sees"
        },
        {
            id: 2,
            text: "Losing real customers due to lack of visibility"
        },
        {
            id: 3,
            text: "Having to justify rates to poorly informed customers"
        }
    ];

    return (
        <div className='py-10 md:pt-20 md:pb-[270px] max-w-[1260px] mx-auto w-full px-5'>
            <div className='relative'>
                <div className='h-[300px] sm:h-[350px] px-5 md:pt-[84.5px] flex justify-center items-center md:items-baseline rounded-[21px]' style={{ background: "url('/assets/problem-bg.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className='text-center'>
                        <h4 className='text-[#3BEE5C] text-[16px] leading-[16px] font-medium'>Problem</h4>
                        <h1 className='text-[23px] sm:text-[32px] leading-[30px] sm:leading-[38px] font-bold text-white my-2.5'>What's not working today</h1>
                        <p className='text-white/70 text-[16px] sm:text-[18px] font-normal leading-[22px] sm:leading-[25px]'>The expectations are clear. Exchango24 provides the missing tool.</p>
                    </div>
                </div>
                <div className='mt-8 md:mt-0 w-full max-w-[866px] md:absolute md:top-[233px] md:left-1/2 md:transform md:-translate-x-1/2 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6'>
                    <div className='bg-white p-6 md:py-[42px] md:px-8 rounded-xl' style={{ boxShadow: '0px 20px 52px 0px #00000029, 0px 4px 4px 0px #00000014' }}>
                        <h2 className='text-[#000000] text-[16px] sm:text-[18px] font-bold leading-[22px] sm:leading-[25px] mb-4'>From the customer side:</h2>
                        <ul className='space-y-4'>
                            {customerProblems.map((problem) => (
                                <li
                                    key={problem.id}
                                    className='flex items-start gap-3 sm:gap-4 text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal'
                                >
                                    <Image
                                        src='/assets/checkbox-icon.svg'
                                        alt='checkbox'
                                        width={24}
                                        height={24}
                                        className='w-[18px] sm:w-[24px]'
                                    />
                                    {problem.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='bg-white p-6 md:py-[42px] md:px-8 rounded-xl' style={{ boxShadow: '0px 20px 52px 0px #00000029, 0px 4px 4px 0px #00000014' }}>
                        <h2 className='text-[#000000] text-[16px] sm:text-[18px] font-bold leading-[22px] sm:leading-[25px] mb-4'>From the exchange office side:</h2>
                        <ul className='space-y-4'>
                            {exchangeOfficeProblems.map((problem) => (
                                <li
                                    key={problem.id}
                                    className='flex items-start gap-3 sm:gap-4 text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal'
                                >
                                    <Image
                                        src='/assets/checkbox-icon.svg'
                                        alt='checkbox'
                                        width={24}
                                        height={24}
                                        className='w-[18px] sm:w-[24px]'    
                                    />
                                    {problem.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Problem;