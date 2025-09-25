import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const LoginHeader = () => {
    return (
        <div className='w-full md:block hidden'>
            <header className="lg:h-[94px] flex justify-between flex-row items-center gap-4 py-5 sm:py-6 px-5 md:px-6 lg:px-8">
                <Link href='/' className="flex items-center w-full lg:w-fit justify-between">
                    <Image src="/assets/logo.svg" alt="ExchanGo24" width={190} height={41} className='sm:w-[190px] w-[143px]' />
                </Link>
                <Link href='/login' className='flex items-center justify-center border border-[#20523C] h-[46px] w-fit px-6 text-[16px] leading-[22px] font-medium text-[#20523C] rounded-md hover:text-white hover:bg-[#20523C] transition duration-300 cursor-pointer'>Register</Link>
            </header>
        </div>
    )
}

export default LoginHeader