import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClockProps {
  className?: string;
  showSeconds?: boolean;
}

export function Clock({ className, showSeconds = false }: ClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatString = showSeconds ? 'h:mm:ss a' : 'h:mm a';

  return <div className={cn('font-mono', className)}>{format(time, formatString)}</div>;
}
