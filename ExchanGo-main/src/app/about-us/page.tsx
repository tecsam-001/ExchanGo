import React from 'react'
import Header from '@/components/Phase3/Header'
import Banner from '@/components/Phase3/AboutUs/Banner'
import TheReasonWhy from '@/components/Phase3/AboutUs/TheReasonWhy'
import Problem from '@/components/Phase3/AboutUs/Problem'
import OurVision from '@/components/Phase3/AboutUs/OurVision'
import Opportunity from '@/components/Phase3/AboutUs/Opportunity'
import WhatWeStandFor from '@/components/Phase3/AboutUs/WhatWeStandFor'
import Footer from '@/components/Footer'

const AboutUs = () => {

    return (
        <div>
            <Header variant='about-us' />
            <Banner/>
            <TheReasonWhy/>
            <Problem/>
            <OurVision/>
            <Opportunity/>
            <WhatWeStandFor/>
            <Footer/>
        </div>
    )
}

export default AboutUs