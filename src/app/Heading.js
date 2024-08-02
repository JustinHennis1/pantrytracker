"use client"; 

import { Box, Typography } from '@mui/material';
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

    return (
        <Box ref={boxRef} sx={{ position: 'fixed', top: 40, left: '10vw', zIndex: 1 }}>
            <Typography variant="h4" color="text.primary">
                AI Inventory Management
            </Typography>
        </Box>
    );
}