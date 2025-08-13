import { cn } from '@/utils';
import {
  Button,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  ScrollBar,
} from '@/components/ui';
import { CalendarIcon } from 'lucide-react';
import { formatDateTimePickerDate, getHours, getMinutes, setHours, setMinutes } from '@/utils';

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date) => void;
  disabled?: boolean;
}

/**
 * A comprehensive date and time picker with calendar and time selection controls
 */
export function DateTimePicker({ date, setDate, disabled }: DateTimePickerProps) {
  function handleDateSelect(selectedDate: Date | undefined) {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      if (date) {
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
      }
      setDate(newDate);
    }
  }

  function handleTimeChange(type: 'hour' | 'minute' | 'ampm', value: string) {
    const currentDate = date || new Date();
    let updatedDate = new Date(currentDate);

    if (type === 'hour') {
      const hour = parseInt(value, 10);
      const isPM = getHours(updatedDate) >= 12;
      updatedDate = setHours(updatedDate, isPM ? hour + 12 : hour);
    } else if (type === 'minute') {
      updatedDate = setMinutes(updatedDate, parseInt(value, 10));
    } else if (type === 'ampm') {
      const hours = getHours(updatedDate);
      if (value === 'AM' && hours >= 12) {
        updatedDate = setHours(updatedDate, hours - 12);
      } else if (value === 'PM' && hours < 12) {
        updatedDate = setHours(updatedDate, hours + 12);
      }
    }

    setDate(updatedDate);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('w-full pl-3 text-left font-normal', !date && 'text-muted-foreground')}
          disabled={disabled}
        >
          {date ? formatDateTimePickerDate(date) : <span>MM/DD/YYYY hh:mm AA</span>}
          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <div className='sm:flex'>
          <Calendar mode='single' selected={date} onSelect={handleDateSelect} initialFocus />
          <div className='flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x'>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex sm:flex-col p-2'>
                {Array.from({ length: 12 }, (_, i) => i + 1)
                  .reverse()
                  .map(hour => (
                    <Button
                      key={hour}
                      size='icon'
                      variant={date && getHours(date) % 12 === hour % 12 ? 'default' : 'ghost'}
                      className='sm:w-full shrink-0 aspect-square'
                      onClick={() => handleTimeChange('hour', hour.toString())}
                    >
                      {hour}
                    </Button>
                  ))}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
            <ScrollArea className='w-64 sm:w-auto'>
              <div className='flex sm:flex-col p-2'>
                {Array.from({ length: 12 }, (_, i) => i * 5).map(minute => (
                  <Button
                    key={minute}
                    size='icon'
                    variant={date && getMinutes(date) === minute ? 'default' : 'ghost'}
                    className='sm:w-full shrink-0 aspect-square'
                    onClick={() => handleTimeChange('minute', minute.toString())}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation='horizontal' className='sm:hidden' />
            </ScrollArea>
            <ScrollArea className=''>
              <div className='flex sm:flex-col p-2'>
                {['AM', 'PM'].map(ampm => (
                  <Button
                    key={ampm}
                    size='icon'
                    variant={
                      date &&
                      ((ampm === 'AM' && getHours(date) < 12) ||
                        (ampm === 'PM' && getHours(date) >= 12))
                        ? 'default'
                        : 'ghost'
                    }
                    className='sm:w-full shrink-0 aspect-square'
                    onClick={() => handleTimeChange('ampm', ampm)}
                  >
                    {ampm}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
