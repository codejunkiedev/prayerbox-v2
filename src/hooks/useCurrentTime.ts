import { useState, useEffect } from 'react';

type ReturnType = {
  currentTime: Date;
};

/**
 * Hook that returns the current time and updates every second
 * @returns {Date} The current time
 */
export const useCurrentTime = (): ReturnType => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Update time immediately
    setCurrentTime(new Date());

    // Set up interval to update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return { currentTime };
};
