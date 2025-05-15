import { useCallback, useState } from 'react';

export function useTrigger(): [number, () => void] {
  const [trigger, setTrigger] = useState(0);

  const triggerUpdate = useCallback(() => {
    setTrigger(prev => prev + 1);
  }, []);

  return [trigger, triggerUpdate];
}
