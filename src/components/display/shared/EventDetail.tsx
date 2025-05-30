import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { itemVariants } from './AnimationProvider';

interface EventDetailProps {
  text: string;
  icon: LucideIcon;
}

export function EventDetail({ text, icon: Icon }: EventDetailProps) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ x: 5 }}
      className='flex items-start justify-between gap-3'
    >
      <span className='rtl text-right'>{text}</span>
      <motion.div whileHover={{ scale: 1.2, rotate: 15 }} className='bg-white/20 p-2 rounded-full'>
        <Icon className='h-5 w-5 text-white' />
      </motion.div>
    </motion.div>
  );
}
