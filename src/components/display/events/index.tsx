import type { Event } from '@/types';
import { Calendar, MapPin, User, Users, Mic } from 'lucide-react';
import { format } from 'date-fns';
import bgImage from '@/assets/backgrounds/03.jpeg';
import {
  AnimationProvider,
  DisplayContainer,
  DisplayCard,
  DisplayHeading,
  EventDetail,
} from '../shared';

interface EventsDisplayProps {
  event: Event;
}

/**
 * Displays event information including title, description, date, time, and details like location, host, and guests
 */
export function EventsDisplay({ event }: EventsDisplayProps) {
  if (!event) return null;

  // Format date
  const formattedDate = format(new Date(event.date_time), 'PPP');
  const formattedTime = format(new Date(event.date_time), 'p');

  return (
    <DisplayContainer backgroundImage={bgImage}>
      {/* Date and Time display above the main container */}
      <div className='flex justify-center items-center mb-6 z-10 animate-fade-in-down animation-delay-200'>
        <div className='flex items-center gap-3 bg-white/10 backdrop-blur-md py-3 px-5 rounded-full'>
          <Calendar className='h-5 w-5 text-white' />
          <span className='text-white font-medium'>
            {formattedDate} at {formattedTime}
          </span>
        </div>
      </div>

      <DisplayCard>
        <AnimationProvider>
          <DisplayHeading title={event.title} />

          <p className='text-white/90 text-sm sm:text-base md:text-lg mb-6 text-center leading-relaxed stagger-item animate-fade-in-up'>
            {event.description}
          </p>

          <div className='w-full stagger-item animate-fade-in-up'>
            <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
              {event.location && <EventDetail text={event.location} icon={MapPin} />}

              {event.chief_guest && (
                <EventDetail text={`مہمان خصوصی: ${event.chief_guest}`} icon={User} />
              )}

              {event.host && <EventDetail text={`میزبان: ${event.host}`} icon={Users} />}

              {event.qari && <EventDetail text={`قاری: ${event.qari}`} icon={Mic} />}
            </div>
          </div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
