'use client'
import React, { useEffect, useRef, useState } from 'react'
import { motion } from "framer-motion"

interface BannerProps {
    selected: "individual" | "exchange";
    setSelected: (selected: "individual" | "exchange") => void;
}

const Banner: React.FC<BannerProps> = ({ selected, setSelected }) => {
    const [buttonWidths, setButtonWidths] = useState({ individual: 0, exchange: 0 })
    const individualRef = useRef<HTMLButtonElement>(null)
    const exchangeRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (individualRef.current && exchangeRef.current) {
            setButtonWidths({
                individual: individualRef.current.offsetWidth,
                exchange: exchangeRef.current.offsetWidth,
            })
        }
    }, [])

    const getIndicatorProps = () => {
        if (selected === "individual") {
            return {
                x: 0,
                width: buttonWidths.individual,
            }
        } else {
            return {
                x: buttonWidths.individual + 7,
                width: buttonWidths.exchange,
            }
        }
    }

    return (
        <div className='h-[350px] sm:h-[400px] px-5 flex items-center text-center flex-col justify-center' style={{ background: "url('/assets/banner-bg.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <h3 className='text-[16px] font-medium text-[#3BEE5C] leading-[16px]'>Ask us Anything</h3>
            <h1 className='text-white  text-[25px] sm:text-[52px] leading-[30px] sm:leading-[62px] font-bold my-4'>Frequently Asked Questions</h1>
            <p className='text-white/70 text-[18px] font-normal leading-[25px]'>These are the most commantly asked questions about ExchangeGo 24</p>
            <div className="mt-6 sm:mt-8 relative bg-white rounded-full p-1 w-fit h-[45px] sm:h-[61px] flex items-center gap-[7px]">
                <motion.div
                    className="absolute top-1 bottom-1 bg-black rounded-full"
                    style={{
                        left: "4px",
                    }}
                    initial={false}
                    animate={getIndicatorProps()}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                    }}
                />

                <button
                    ref={individualRef}
                    onClick={() => setSelected("individual")}
                    className={`relative z-10 px-5 sm:px-6 cursor-pointer h-full rounded-full text-[16px] sm:text-[18px] font-normal leading-[22px] sm:leading-[25px] transition-colors duration-200 whitespace-nowrap ${selected === "individual" ? "text-white" : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    Individual
                </button>

                <button
                    ref={exchangeRef}
                    onClick={() => setSelected("exchange")}
                    className={`relative z-10 px-5 sm:px-6 cursor-pointer h-full rounded-full text-[16px] sm:text-[18px] font-normal leading-[22px] sm:leading-[25px] transition-colors duration-200 whitespace-nowrap ${selected === "exchange" ? "text-white" : "text-gray-600 hover:text-gray-800"
                        }`}
                >
                    Exchange Office
                </button>
            </div>
        </div>
    )
}

export default Banner