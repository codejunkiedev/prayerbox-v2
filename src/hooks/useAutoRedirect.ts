import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';

interface UseAutoRedirectOptions {
  to: string;
  delaySeconds?: number;
  onRedirect?: () => void;
}

export function useAutoRedirect({ to, delaySeconds = 5, onRedirect }: UseAutoRedirectOptions) {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(delaySeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const redirectedRef = useRef(false);

  const redirectNow = useCallback(() => {
    if (!redirectedRef.current) {
      redirectedRef.current = true;
      if (onRedirect) onRedirect();
      navigate(to, { replace: true });
    }
  }, [navigate, to, onRedirect]);

  useEffect(() => {
    setSecondsLeft(delaySeconds);
    redirectedRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          redirectNow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, delaySeconds]);

  return { secondsLeft, redirectNow };
}
