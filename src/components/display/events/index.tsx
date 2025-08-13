import type { Event } from '@/types';
import { Calendar, MapPin, User, Users, Mic } from 'lucide-react';
import { format } from 'date-fns';
import bgImage from '@/assets/backgrounds/03.jpeg';
import { motion } from 'framer-motion';
import {
  AnimationProvider,
  DisplayContainer,
  DisplayCard,
  DisplayHeading,
  EventDetail,
  itemVariants,
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className='flex justify-center items-center mb-6 z-10'
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className='flex items-center gap-3 bg-white/10 backdrop-blur-md py-3 px-5 rounded-full'
        >
          <Calendar className='h-5 w-5 text-white' />
          <span className='text-white font-medium'>
            {formattedDate} at {formattedTime}
          </span>
        </motion.div>
      </motion.div>

      <DisplayCard>
        <AnimationProvider>
          <DisplayHeading title={event.title} />

          <motion.p
            variants={itemVariants}
            className='text-white/90 text-sm sm:text-base md:text-lg mb-6 text-center leading-relaxed'
          >
            {event.description}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className='bg-white/10 rounded-lg p-4 backdrop-blur-sm'
          >
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm md:text-base text-white'>
              {event.location && <EventDetail text={event.location} icon={MapPin} />}

              {event.chief_guest && (
                <EventDetail text={`مہمان خصوصی: ${event.chief_guest}`} icon={User} />
              )}

              {event.host && <EventDetail text={`میزبان: ${event.host}`} icon={Users} />}

              {event.qari && <EventDetail text={`قاری: ${event.qari}`} icon={Mic} />}
            </div>
          </motion.div>
        </AnimationProvider>
      </DisplayCard>
    </DisplayContainer>
  );
}
