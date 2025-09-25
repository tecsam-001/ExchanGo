import React from 'react'

const Banner = () => {
    return (
        <div className='h-[300px] sm:h-[400px] flex items-center flex-col justify-center text-center px-5' style={{ background: "url('/assets/banner-bg.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <h3 className='text-[16px] font-medium text-[#3BEE5C] leading-[16px]'>Introducing</h3>
            <h1 className='text-white text-[25px] sm:text-[52px] leading-[30px] sm:leading-[62px] font-bold my-4'>About ExchangeGo24</h1>
            <p className='text-white/70 text-[16px] sm:text-[18px] font-normal leading-[22px] sm:leading-[25px]'>The right rate. At the right time. Without wasting time.</p>
        </div>
    )
}

export default Banner