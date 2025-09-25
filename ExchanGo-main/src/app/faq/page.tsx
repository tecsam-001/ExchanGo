'use client'
import Banner from '@/components/Phase3/FAQ/Banner'
import BestDealsAreWaiting from '@/components/BestDealsAreWaiting'
import Category from '@/components/Phase3/FAQ/Category'
import Footer from '@/components/Footer'
import Header from '@/components/Phase3/Header'
import React, { useState } from 'react'

const FAQ = () => {
    const [faqType, setFaqType] = useState<'individual' | 'exchange'>('individual');

    return (
        <div>
            <Header variant='faq'/>
            <Banner selected={faqType} setSelected={setFaqType} />
            <Category faqType={faqType} />
            <BestDealsAreWaiting/>
            <Footer/>
        </div>
    )
}

export default FAQ