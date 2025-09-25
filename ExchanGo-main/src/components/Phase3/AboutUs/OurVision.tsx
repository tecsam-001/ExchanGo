import Image from 'next/image';
import React from 'react';

interface VisionItem {
    id: number;
    text: string;
}

interface FloatingLabel {
    id: number;
    text: string;
    position: string;
    maxWidth?: string;
}

const OurVision: React.FC = () => {
    const visionItems: VisionItem[] = [
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
    ];

    const floatingLabels: FloatingLabel[] = [
        {
            id: 1,
            text: "No Rank office",
            position: "top-[200px] sm:top-[260px] left-0 xl-left-[40px]"
        },
        {
            id: 2,
            text: "Do not handle money",
            position: "top-[90px] sm:top-[138px] right-0 xl:-right-[20px]"
        },
        {
            id: 3,
            text: "Do not impose any business model",
            position: "bottom-[40px] sm:bottom-[101px] right-0 xl-right-[40px]",
            maxWidth: "max-w-[180px] sm:max-w-[222px]"
        }
    ];

    return (
        <div className='py-20 md:py-[120px] max-w-[1260px] mx-auto flex items-center justify-between lg:flex-row flex-col-reverse px-5 gap-10 lg:gap-0'>
            <div className='lg:max-w-[608px] w-full'>
                <h4 className='text-[#20523C] text-[16px] leading-[16px] font-medium'>Our Vision</h4>
                <h1 className='text-[#000000] text-[23px] sm:text-[32px] leading-[30px] sm:leading-[38px] font-bold my-3 sm:my-4'>
                    A useful tool, Exchango24 is not a bank, nor a money transfer app.
                </h1>
                <p className='text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal lg:max-w-[503px] w-full'>
                    We don't handle money. We don't classify exchange offices. Each professional retains control of their rates, hours, and conditions.
                </p>
                <p className='mt-4 sm:mt-6 text-[#585858] text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal lg:max-w-[503px] w-full'>
                    Our mission: to simplify exchange by bringing consumers and exchange offices closer together.
                </p>
            </div>
            <div className='w-full max-w-[503px] relative overflow-hidden xl:overflow-visible'>
                <Image
                    src='/assets/mobile-design.png'
                    alt='mobile-design'
                    width={503}
                    height={550}
                />

                {floatingLabels.map((label) => (
                    <h3
                        key={label.id}
                        className={`absolute ${label.position} shadow-[0px_5px_5px_0px_#00000029] sm:shadow-[0px_10px_40px_0px_#00000029] w-fit px-3.5 sm:px-5 leading-[24px] rounded-xl text-[16px] sm:text-[20px] py-2.5 sm:py-4 bg-white ${label.maxWidth || ''}`}
                    >
                        {label.text}
                    </h3>
                ))}
            </div>
        </div>
    );
};

export default OurVision;