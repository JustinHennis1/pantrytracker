"use client"; 

import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Heading() {
    gsap.registerPlugin(ScrollTrigger);

    const boxRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(boxRef.current, 
                { opacity: 1 }, 
                { 
                    opacity: 0, 
                    scrollTrigger: {
                        trigger: boxRef.current,
                        start: 'top top',
                        end: 'bottom top',
                        scrub: true
                    }
                }
            );
        }, boxRef);

        return () => ctx.revert();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <Box 
        ref={boxRef} 
        sx={{ 
            position: 'fixed', 
            top: '0', 
            left: '0',
            right: '0',
            zIndex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '10px',
            maxWidth: '1200px',
            margin: '0 auto',
            boxSizing: 'border-box',
        }}>
            <Box variant="contained" bgcolor='white' borderRadius={100} onClick={scrollToTop} sx={{ cursor: 'pointer' }}>
                <Image src="/images/dashelf/logo_transparent.png" alt="logo" width={200} height={200} priority={true} />
            </Box>
        </Box>
    );
}