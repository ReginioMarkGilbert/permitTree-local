import { useState, useEffect } from 'react';

/**
 * A hook that creates a typewriter effect for text
 * @param {string} text - The text to animate
 * @param {number} [speed=10] - The speed of typing in milliseconds
 * @returns {string} The currently displayed text
 */
export const useTypewriter = (text = '', speed = 10) => {
   const [displayedText, setDisplayedText] = useState('');

   useEffect(() => {
      setDisplayedText(''); // Reset text when input text changes
      let currentIndex = 0;

      const interval = setInterval(() => {
         if (currentIndex <= text.length) {
            setDisplayedText(text.slice(0, currentIndex));
            currentIndex++;
         } else {
            clearInterval(interval);
         }
      }, speed);

      return () => clearInterval(interval);
   }, [text, speed]);

   return displayedText;
};
