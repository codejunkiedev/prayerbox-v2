export function PrayerTimesLoading() {
  return (
    <div className='flex justify-center p-8'>
      <div className='animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full'></div>
      <span className='sr-only'>Fetching prayer times...</span>
    </div>
  );
}
