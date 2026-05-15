import { useEffect, useRef, useState } from 'react';
import { Input } from './input';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Color picker that coalesces rapid drag events through requestAnimationFrame,
 * so the parent re-renders at most once per frame instead of on every event.
 */
export function ColorInput({ value, onChange, className }: ColorInputProps) {
  const [local, setLocal] = useState(value);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef(value);
  const externalRef = useRef(value);

  useEffect(() => {
    if (value !== externalRef.current) {
      externalRef.current = value;
      setLocal(value);
    }
  }, [value]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  return (
    <Input
      type='color'
      value={local}
      onChange={e => {
        const next = e.target.value;
        setLocal(next);
        pendingRef.current = next;
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            externalRef.current = pendingRef.current;
            onChange(pendingRef.current);
          });
        }
      }}
      className={className}
    />
  );
}
