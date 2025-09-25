import React from 'react'
import Header from '@/components/Phase3/Header'
import Footer from '@/components/Footer'
import MentionsLegalesContent from '@/components/Phase3/MentionsLegales/MentionsLegalesContent'

const MentionsLegales = () => {
    return (
        <div>
            <Header variant='about-us' />
            <MentionsLegalesContent />
            <Footer />
        </div>
    )
}

export default MentionsLegales
