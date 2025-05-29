export function BackgroundPatterns() {
  return (
    <>
      {/* Background pattern - top left */}
      <div className='absolute top-0 left-0 w-48 h-48 opacity-20'>
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </div>

      {/* Background pattern - bottom right */}
      <div className='absolute bottom-0 right-0 w-48 h-48 opacity-20'>
        <div className='w-full h-full bg-primary/30 rounded-full blur-xl'></div>
      </div>
    </>
  );
}
