import { Card, CardContent } from '@/components/ui';
import type { Event } from '@/types';
import { Calendar, Clock, MapPin, User, Users, Mic } from 'lucide-react';
import { format } from 'date-fns';

interface EventsDisplayProps {
  event: Event;
}

export function EventsDisplay({ event }: EventsDisplayProps) {
  if (!event) return null;

  // Format date
  const formattedDate = format(new Date(event.date_time), 'PPP');
  const formattedTime = format(new Date(event.date_time), 'p');

  return (
    <div className='flex flex-col items-center justify-center min-h-screen w-full bg-primary-foreground overflow-hidden relative'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 z-0'></div>

      <Card className='w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-card/95 backdrop-blur-sm z-10'>
        <CardContent className='p-3 sm:p-4 md:p-6'>
          <div className='flex flex-col'>
            <h2 className='text-lg sm:text-xl font-semibold text-primary mb-4 text-center'>
              {event.title}
            </h2>

            <p className='text-foreground/90 text-sm sm:text-base mb-4 text-center'>
              {event.description}
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4 text-primary' />
                <span>{formattedDate}</span>
              </div>

              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-primary' />
                <span>{formattedTime}</span>
              </div>

              {event.location && (
                <div className='flex items-center gap-2'>
                  <MapPin className='h-4 w-4 text-primary' />
                  <span>{event.location}</span>
                </div>
              )}

              {event.chief_guest && (
                <div className='flex items-center gap-2'>
                  <User className='h-4 w-4 text-primary' />
                  <span>Chief Guest: {event.chief_guest}</span>
                </div>
              )}

              {event.host && (
                <div className='flex items-center gap-2'>
                  <Users className='h-4 w-4 text-primary' />
                  <span>Host: {event.host}</span>
                </div>
              )}

              {event.qari && (
                <div className='flex items-center gap-2'>
                  <Mic className='h-4 w-4 text-primary' />
                  <span>Qari: {event.qari}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
