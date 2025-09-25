import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const BackToLoginButton = () => {
    return (
        <Link href="/admin" className="w-full h-[50px] rounded-lg border border-[#DEDEDE] text-[#111111] text-[16px] leading-[22px] font-normal flex items-center justify-center gap-1.5">
            <Image src='/assets/arrow-back.svg' alt="arrow-back" width={20} height={20} className="rotate-180" />
            Back to login
        </Link>
    )
}

export default BackToLoginButton