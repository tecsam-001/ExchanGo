import React from 'react'
import HeroSection from '@/components/Phase3/HeroSection'
import JoinUsSection from '@/components/Phase3/JoinUs'
import DisplaySection from '@/components/Phase3/Display'
import BenefitSection from '@/components/Phase3/Benefits'
import TestimonialSection from '@/components/Phase3/Testimonial'
import FAQsSection from '@/components/Phase3/FAQs'
import OfficeSection from '@/components/Phase3/OfficeSection'
import Footer from '@/components/Footer'

const LandingPage = () => {
   return (
      <>
         <HeroSection />
         <JoinUsSection />
         <DisplaySection />
         <BenefitSection />
         <TestimonialSection />
         <FAQsSection />
         <OfficeSection />
         <Footer />
      </>

   )
}

export default LandingPage