'use client';

import { useState, useEffect } from 'react';

const useScreenHeight = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const calculateItemsPerPage = () => {
      const height = window.innerHeight;
      
      // Calculate based on screen height
      // Large screens (>= 1024px height): 10 items
      // Medium screens (768px - 1023px height): 8 items  
      // Small screens (< 768px height): 6 items
      if (height >= 1024) {
        setItemsPerPage(10);
      } else if (height >= 768) {
        setItemsPerPage(8);
      } else {
        setItemsPerPage(6);
      }
    };

    calculateItemsPerPage();
    window.addEventListener('resize', calculateItemsPerPage);

    return () => window.removeEventListener('resize', calculateItemsPerPage);
  }, []);

  return itemsPerPage;
};

export default useScreenHeight;