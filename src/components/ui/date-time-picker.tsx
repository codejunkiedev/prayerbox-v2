import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date) => void;
  disabled?: boolean;
}

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
    let updatedDate = dayjs(currentDate);

    if (type === 'hour') {
      const hour = parseInt(value, 10);
      const isPM = updatedDate.hour() >= 12;
      updatedDate = updatedDate.hour(isPM ? hour + 12 : hour);
    } else if (type === 'minute') {
      updatedDate = updatedDate.minute(parseInt(value, 10));
    } else if (type === 'ampm') {
      const hours = updatedDate.hour();
      if (value === 'AM' && hours >= 12) {
        updatedDate = updatedDate.hour(hours - 12);
      } else if (value === 'PM' && hours < 12) {
        updatedDate = updatedDate.hour(hours + 12);
      }
    }

    setDate(updatedDate.toDate());
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('w-full pl-3 text-left font-normal', !date && 'text-muted-foreground')}
          disabled={disabled}
        >
          {date ? (
            // Use dayjs for formatting
            dayjs(date).format('MM/DD/YYYY hh:mm A')
          ) : (
            <span>MM/DD/YYYY hh:mm AA</span>
          )}
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
                      variant={date && dayjs(date).hour() % 12 === hour % 12 ? 'default' : 'ghost'}
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
                    variant={date && dayjs(date).minute() === minute ? 'default' : 'ghost'}
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
                      ((ampm === 'AM' && dayjs(date).hour() < 12) ||
                        (ampm === 'PM' && dayjs(date).hour() >= 12))
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
