import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Clock } from 'lucide-react';
import { format, setHours, setMinutes, getHours, getMinutes } from 'date-fns';

interface TimePickerProps {
  time: Date | undefined;
  setTime: (time: Date) => void;
  disabled?: boolean;
}

export function TimePicker({ time, setTime, disabled }: TimePickerProps) {
  function handleTimeChange(type: 'hour' | 'minute' | 'ampm', value: string) {
    const currentTime = time || new Date();
    let updatedTime = new Date(currentTime);

    if (type === 'hour') {
      const hour = parseInt(value, 10);
      const isPM = getHours(updatedTime) >= 12;
      updatedTime = setHours(updatedTime, isPM ? hour + 12 : hour);
    } else if (type === 'minute') {
      updatedTime = setMinutes(updatedTime, parseInt(value, 10));
    } else if (type === 'ampm') {
      const hours = getHours(updatedTime);
      if (value === 'AM' && hours >= 12) {
        updatedTime = setHours(updatedTime, hours - 12);
      } else if (value === 'PM' && hours < 12) {
        updatedTime = setHours(updatedTime, hours + 12);
      }
    }

    setTime(updatedTime);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('w-full pl-3 text-left font-normal', !time && 'text-muted-foreground')}
          disabled={disabled}
        >
          {time ? format(time, 'hh:mm a') : <span>hh:mm AA</span>}
          <Clock className='ml-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x'>
          <ScrollArea className='w-64 sm:w-auto h-60'>
            <div className='flex sm:flex-col p-2 gap-1'>
              {Array.from({ length: 12 }, (_, i) => i + 1)
                .reverse()
                .map(hour => (
                  <Button
                    key={hour}
                    size='sm'
                    variant={time && getHours(time) % 12 === hour % 12 ? 'default' : 'ghost'}
                    className='sm:w-full h-9 shrink-0'
                    onClick={() => handleTimeChange('hour', hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
            </div>
            <ScrollBar orientation='horizontal' className='sm:hidden' />
          </ScrollArea>
          <ScrollArea className='w-64 sm:w-auto h-60'>
            <div className='flex sm:flex-col p-2 gap-1'>
              {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                <Button
                  key={minute}
                  size='sm'
                  variant={time && getMinutes(time) === minute ? 'default' : 'ghost'}
                  className='sm:w-full h-9 shrink-0'
                  onClick={() => handleTimeChange('minute', minute.toString())}
                >
                  {minute.toString().padStart(2, '0')}
                </Button>
              ))}
            </div>
            <ScrollBar orientation='horizontal' className='sm:hidden' />
          </ScrollArea>
          <ScrollArea className='h-60'>
            <div className='flex sm:flex-col p-2 gap-1'>
              {['AM', 'PM'].map(ampm => (
                <Button
                  key={ampm}
                  size='sm'
                  variant={
                    time &&
                    ((ampm === 'AM' && getHours(time) < 12) ||
                      (ampm === 'PM' && getHours(time) >= 12))
                      ? 'default'
                      : 'ghost'
                  }
                  className='sm:w-full h-9 shrink-0'
                  onClick={() => handleTimeChange('ampm', ampm)}
                >
                  {ampm}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
