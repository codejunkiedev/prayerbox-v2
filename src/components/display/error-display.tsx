import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils';
import { motion } from 'framer-motion';
import bgImage from '@/assets/backgrounds/06.jpeg';

export type ErrorMessage = { title: string; description: string };

interface ErrorDisplayProps {
  errorMessage: ErrorMessage | null;
  className?: string;
}

export function ErrorDisplay({ errorMessage, className }: ErrorDisplayProps) {
  if (!errorMessage) return null;

  return (
    <div
      className={cn(
        'flex flex-col h-screen w-full overflow-hidden relative bg-cover bg-center',
        className
      )}
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/50 backdrop-blur-sm z-0'
      ></motion.div>

      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ duration: 0.8 }}
        className='absolute top-0 left-0 w-48 h-48 z-10'
      >
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 0.2, x: 0 }}
        transition={{ duration: 0.8 }}
        className='absolute bottom-0 right-0 w-48 h-48 z-10'
      >
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </motion.div>

      <div className='flex flex-col items-center justify-center h-full w-full px-4 py-8 z-20'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-2xl bg-black/30 backdrop-blur-md rounded-xl border border-white/10'
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 10px 0px rgba(255, 255, 255, 0.1)',
                '0 0 20px 3px rgba(255, 255, 255, 0.2)',
                '0 0 10px 0px rgba(255, 255, 255, 0.1)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className='p-6 sm:p-8 flex flex-col items-center text-center'
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <AlertTriangle className='h-12 w-12 text-red-500 mb-4' />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='text-2xl font-semibold text-white mb-2'
            >
              {errorMessage.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='text-white/80 mb-6'
            >
              {errorMessage.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                onClick={() => window.location.reload()}
                variant='outline'
                className='mt-2 hover:bg-white/10'
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className='mr-2'
                >
                  <RefreshCcw className='w-4 h-4' />
                </motion.div>
                Try Again
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
