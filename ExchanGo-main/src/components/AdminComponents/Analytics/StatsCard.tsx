import Image from 'next/image';
import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  percentage: string | number;
  changeText: string;
  isPositive?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  percentage,
  changeText,
  isPositive = true
}) => {
  return (
    <div
      className='rounded-lg transition-all group duration-300 ease-out hover:scale-105 hover:-translate-y-0.5 cursor-pointer'
      style={{
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.10), 0px 2px 2px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0px 8px 10px rgba(0, 0, 0, 0.15), 0px 4px 8px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0px 2px 10px rgba(0, 0, 0, 0.10), 0px 2px 2px rgba(0, 0, 0, 0.08)';
      }}
    >
      <div className='p-4'>
        <div className='flex items-center gap-1'>
          <h2 className='text-[#585858] text-[12px] leading-[17px] font-normal'>
            {title}
          </h2>
          <Image
            src='/assets/info.svg'
            alt='info'
            width={14}
            height={14}
          />
        </div>
        <div className='mt-1.5 flex items-start flex-col gap-1'>
          <h2 className='text-[#111111] text-[36px] leading-[43px] font-semibold'>
            {value}
          </h2>
          <div className={`${isPositive ? 'bg-[#C2ECD2]' : 'bg-[#FECACA]'
            } rounded-[1000px] px-1.5 py-0.5 flex justify-center gap-0.5`}>
            <Image
              src={isPositive ? '/assets/arrow-up.svg' : '/assets/arrow-down.svg'}
              alt={isPositive ? 'arrow-up' : 'arrow-down'}
              width={14.19}
              height={14.19}
            />
            <h3 className={`${isPositive ? 'text-[#20523C]' : 'text-[#991B1B]'
              } text-[12px] leading-[17px] font-normal mt-[1px]`}>
              {percentage}%
            </h3>
          </div>
        </div>
      </div>
      <div className='bg-[#F5F7F9] py-3 px-4 rounded-b-lg group-hover:bg-[#EDF2F7] transition-colors duration-300'>
        <h2 className='text-[#585858] text-[12px] font-normal leading-[17px]'>
          {changeText}
        </h2>
      </div>
    </div>
  );
};

export default StatsCard;