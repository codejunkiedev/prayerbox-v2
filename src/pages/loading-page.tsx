import { useEffect, useState } from 'react';

export default function Loading() {
  const [progress, setProgress] = useState(0);

  // Animation for the progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        // Reset to 0 when reaching 100
        if (prev >= 100) return 0;
        // Random increment between 5-15
        return Math.min(100, prev + Math.floor(Math.random() * 10) + 5);
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-blue-950/30 dark:via-background dark:to-purple-950/30'>
      <div className='flex flex-col items-center gap-8 px-4 text-center'>
        {/* PrayerBox logo (matching sidebar style) */}
        <div className='flex flex-col items-center gap-4'>
          <div className='relative'>
            <div className='absolute -inset-8 rounded-full bg-gradient-to-r from-blue-400/20 via-emerald-500/20 to-purple-400/20 blur-xl animate-pulse'></div>

            <div className='relative w-24 h-24 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 flex items-center justify-center shadow-lg border border-slate-700/50'>
              <div className='w-16 h-16 rounded-lg bg-emerald-500 flex items-center justify-center transition-transform duration-200'>
                <span className='font-bold text-white text-4xl'>P</span>
              </div>
            </div>
          </div>

          <h1 className='text-3xl font-semibold bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-blue-400'>
            PrayerBox
          </h1>
        </div>

        <div className='space-y-3'>
          <p className='text-muted-foreground'>Preparing your spiritual journey</p>

          {/* Dynamic progress bar */}
          <div className='mt-4 h-2 w-60 max-w-full overflow-hidden rounded-full bg-secondary'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-blue-500 transition-all duration-300 ease-out'
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className='text-xs text-muted-foreground/70'>{progress}%</p>
        </div>
      </div>
    </div>
  );
}
