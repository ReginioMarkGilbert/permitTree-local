import { useState, useEffect } from 'react';

export const useTypewriter = (text, speed = 10) => {
   const [displayedText, setDisplayedText] = useState('');

   useEffect(() => {
      setDisplayedText(''); // Reset text when input text changes

      let i = 0;
      const timer = setInterval(() => {
         if (i < text.length) {
            setDisplayedText(prev => prev + text.charAt(i));
            i++;
         } else {
            clearInterval(timer);
         }
      }, speed);

      return () => clearInterval(timer);
   }, [text, speed]);

   return displayedText;
};
