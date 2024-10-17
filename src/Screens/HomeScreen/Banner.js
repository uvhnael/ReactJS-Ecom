// src/Hero.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const Banner = () => {
    const heroImages = [
        "http://localhost:8000/uploads/slideshow1.png",
        "http://localhost:8000/uploads/slideshow2.png",
        "http://localhost:8000/uploads/slideshow3.png",
        "http://localhost:8000/uploads/slideshow4.png"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [heroImages.length]);

    const handlePrevClick = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1));
    };

    const handleNextClick = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1));
    };

    return (
        <div>
            <img src={heroImages[currentImageIndex]} alt="hero" className="w-full h-144 object-cover" />
            <button
                onClick={handlePrevClick}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white px-4 py-2 rounded-full focus:outline-none z-20"
            >
                <FontAwesomeIcon icon="fa-solid fa-chevron-left" className='h-10' />
            </button>
            <button
                onClick={handleNextClick}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white px-4 py-2 rounded-full focus:outline-none z-20"
            >
                <FontAwesomeIcon icon="fa-solid fa-chevron-right" className='h-10' />
            </button>
        </div>
    );
};

export default Banner;
