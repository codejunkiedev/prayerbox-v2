import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, Globe } from 'lucide-react';
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from '@/components/ui';
import { canonicalTimeZone, cn, describeTimeZone, listTimeZones } from '@/utils';

interface TimezonePickerProps {
  value: string;
  onChange: (timeZone: string) => void;
  disabled?: boolean;
  invalid?: boolean;
}

/**
 * Searchable IANA timezone picker
 */
export function TimezonePicker({ value, onChange, disabled, invalid }: TimezonePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const zones = useMemo(() => {
    const all = listTimeZones();
    // A zone can be valid without being in the runtime's canonical list —
    // Asia/Kolkata and Europe/Kyiv are both absent from it.
    return value && !all.includes(value) ? [value, ...all] : all;
  }, [value]);

  // Built once rather than per render: describing all ~420 zones costs a fresh
  // Intl.DateTimeFormat each, and the list re-renders on every keystroke.
  const labels = useMemo(() => new Map(zones.map(zone => [zone, describeTimeZone(zone)])), [zones]);

  const regions = useMemo(() => [...new Set(zones.map(zone => zone.split('/')[0]))], [zones]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/_/g, ' ');
    if (!needle) return zones;

    // Matched against the readable spelling so "addis ababa" finds Addis_Ababa.
    const direct = zones.filter(zone => zone.toLowerCase().replace(/_/g, ' ').includes(needle));
    if (direct.length > 0) return direct;

    // Renamed zones are absent from the canonical list, so "Kolkata" matches
    // nothing while Asia/Calcutta — the same clock — is right there. Probe the
    // regions for what was typed and offer whatever it canonicalises to.
    const city = query.trim().replace(/\s+/g, '_');
    const resolved = regions
      .map(region => canonicalTimeZone(`${region}/${city}`))
      .filter((zone): zone is string => zone !== null);

    return [...new Set(resolved)];
  }, [zones, query, regions]);

  if (zones.length === 0) {
    return (
      <Input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder='e.g. Asia/Karachi'
        disabled={disabled}
        className={invalid ? 'border-red-500' : ''}
      />
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={next => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            invalid && 'border-red-500'
          )}
        >
          <span className='flex items-center gap-2 truncate'>
            <Globe className='h-4 w-4 shrink-0 opacity-50' />
            {value ? describeTimeZone(value) : 'Select timezone'}
          </span>
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[var(--radix-popover-trigger-width)] p-0' align='start'>
        <div className='flex items-center gap-2 p-2'>
          <Input
            autoFocus
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder='Search e.g. Karachi'
          />
          <span className='text-xs text-muted-foreground whitespace-nowrap'>
            {matches.length} of {zones.length}
          </span>
        </div>
        <ScrollArea className='h-72'>
          <div className='p-1'>
            {matches.length === 0 ? (
              <p className='px-3 py-6 text-center text-sm text-muted-foreground'>
                No timezone matches “{query}”
              </p>
            ) : (
              matches.map(zone => (
                <button
                  key={zone}
                  type='button'
                  onClick={() => {
                    onChange(zone);
                    setOpen(false);
                    setQuery('');
                  }}
                  className='flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-accent'
                >
                  <Check
                    className={cn('h-4 w-4 shrink-0', zone === value ? 'opacity-100' : 'opacity-0')}
                  />
                  <span className='truncate'>{labels.get(zone) ?? describeTimeZone(zone)}</span>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
