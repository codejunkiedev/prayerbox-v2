import type { Event, ScreenOrientation } from '@/types';
import { Calendar, MapPin, User, Users, Mic } from 'lucide-react';
import { format } from 'date-fns';
import bgImage from '@/assets/backgrounds/02.jpeg';
import {
  AnimationProvider,
  DisplayContainer,
  DisplayCard,
  DisplayHeading,
  EventDetail,
} from '../shared';

interface EventsDisplayProps {
  event: Event;
  orientation?: ScreenOrientation;
}

/**
 * Displays event information including title, description, date, time, and details like location, host, and guests
 */
export function EventsDisplay({ event, orientation = 'landscape' }: EventsDisplayProps) {
  if (!event) return null;

  const isPortrait = orientation === 'portrait';

  // Format date
  const formattedDate = format(new Date(event.date_time), 'PPP');
  const formattedTime = format(new Date(event.date_time), 'p');

  return (
    <DisplayContainer backgroundImage={bgImage}>
      {/* Date and Time display above the main container */}
      <div className='flex justify-center items-center mb-6 z-10 animate-fade-in-down animation-delay-200'>
        <div
          className={`flex items-center gap-3 bg-white/10 backdrop-blur-md py-3 px-5 rounded-full ${
            isPortrait ? 'gap-[2vw] py-[1.5vh] px-[4vw]' : ''
          }`}
        >
          <Calendar
            className={isPortrait ? 'text-white' : 'h-5 w-5 text-white'}
            style={isPortrait ? { width: '4vw', height: '4vw' } : undefined}
          />
          <span className={`text-white font-medium ${isPortrait ? 'text-[3vw]' : ''}`}>
            {formattedDate} at {formattedTime}
          </span>
        </div>
      </div>

      <DisplayCard>
        <AnimationProvider>
          <DisplayHeading title={event.title} />

          <p
            className={`text-white/90 mb-6 text-center leading-relaxed stagger-item animate-fade-in-up ${
              isPortrait ? 'text-[3vw]' : 'text-sm sm:text-base md:text-lg'
            }`}
          >
            {event.description}
          </p>

          <div className='w-full stagger-item animate-fade-in-up'>
            <div
              className={
                isPortrait ? 'grid grid-cols-1 gap-y-[2vh]' : 'grid grid-cols-2 gap-x-8 gap-y-4'
              }
            >
              {event.location && (
                <EventDetail text={event.location} icon={MapPin} isPortrait={isPortrait} />
              )}

              {event.chief_guest && (
                <EventDetail
                  label='مہمان خصوصی'
                  text={event.chief_guest}
                  icon={User}
                  isPortrait={isPortrait}
                />
              )}

              {event.host && (
                <EventDetail
                  label='میزبان'
                  text={event.host}
                  icon={Users}
                  isPortrait={isPortrait}
                />
              )}

              {event.qari && (
                <EventDetail label='قاری' text={event.qari} icon={Mic} isPortrait={isPortrait} />
              )}
            </div>
          </div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
