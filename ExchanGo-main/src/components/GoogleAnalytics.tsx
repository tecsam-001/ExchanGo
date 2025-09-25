"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-KP47LECDL9";

export default function GoogleAnalytics() {
    const pathname = usePathname();

    useEffect(() => {
        ReactGA.initialize(GA_MEASUREMENT_ID);
    }, []);

    useEffect(() => {
        ReactGA.send({ hitType: "pageview", page: pathname });
    }, [pathname]);

    return null;
} 