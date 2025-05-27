import { useCallback, useState } from 'react';

/**
 * Custom hook that provides a way to trigger re-renders or effects
 * by incrementing a counter value
 * @returns [trigger, triggerUpdate] - The counter value and a function to increment it
 */
export function useTrigger(): [number, () => void] {
  const [trigger, setTrigger] = useState(0);

  // Function to increment the trigger counter, causing dependent effects to run
  const triggerUpdate = useCallback(() => {
    setTrigger(prev => prev + 1);
  }, []);

  return [trigger, triggerUpdate];
}
