import type { Event } from '@/types';
import { Calendar, MapPin, User, Users, Mic } from 'lucide-react';
import { format } from 'date-fns';
import bgImage from '@/assets/backgrounds/03.jpeg';

interface EventsDisplayProps {
  event: Event;
}

export function EventsDisplay({ event }: EventsDisplayProps) {
  if (!event) return null;

  // Format date
  const formattedDate = format(new Date(event.date_time), 'PPP');
  const formattedTime = format(new Date(event.date_time), 'p');

  return (
    <div
      className='flex flex-col items-center justify-center min-h-screen w-full overflow-hidden relative bg-cover bg-center'
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm z-0'></div>

      {/* Date and Time display above the main container */}
      <div className='flex justify-center items-center mb-6 z-10'>
        <div className='flex items-center gap-3 bg-white/10 backdrop-blur-md py-3 px-5 rounded-full'>
          <Calendar className='h-5 w-5 text-white' />
          <span className='text-white font-medium'>
            {formattedDate} at {formattedTime}
          </span>
        </div>
      </div>

      <div className='w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl z-10'>
        <div className='p-5 sm:p-6 md:p-8'>
          <div className='flex flex-col'>
            <div className='text-center mb-6'>
              <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3'>
                {event.title}
              </h1>
              <div className='h-1 w-20 bg-white/30 mx-auto rounded-full'></div>
            </div>

            <p className='text-white/90 text-sm sm:text-base md:text-lg mb-6 text-center leading-relaxed'>
              {event.description}
            </p>

            <div className='bg-white/10 rounded-lg p-4 backdrop-blur-sm'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm md:text-base text-white'>
                {event.location && (
                  <div className='flex items-start justify-between gap-3'>
                    <span className='rtl text-right'>{event.location}</span>
                    <div className='bg-white/20 p-2 rounded-full'>
                      <MapPin className='h-5 w-5 text-white' />
                    </div>
                  </div>
                )}

                {event.chief_guest && (
                  <div className='flex items-start justify-between gap-3'>
                    <span className='rtl text-right'>مہمان خصوصی: {event.chief_guest}</span>
                    <div className='bg-white/20 p-2 rounded-full'>
                      <User className='h-5 w-5 text-white' />
                    </div>
                  </div>
                )}

                {event.host && (
                  <div className='flex items-start justify-between gap-3'>
                    <span className='rtl text-right'>میزبان: {event.host}</span>
                    <div className='bg-white/20 p-2 rounded-full'>
                      <Users className='h-5 w-5 text-white' />
                    </div>
                  </div>
                )}

                {event.qari && (
                  <div className='flex items-start justify-between gap-3'>
                    <span className='rtl text-right'>قاری: {event.qari}</span>
                    <div className='bg-white/20 p-2 rounded-full'>
                      <Mic className='h-5 w-5 text-white' />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
