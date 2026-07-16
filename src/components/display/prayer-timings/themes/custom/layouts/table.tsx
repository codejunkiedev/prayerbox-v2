import type { CustomThemeParts } from '../parts';

/**
 * The custom theme's original arrangement, inherited from Theme 3: an info bar
 * across the top, a full prayer table, and the countdown in its own card. The
 * default layout, and what every theme saved before the layout selector shipped
 * resolves to.
 */
export function TableLayout({ parts }: { parts: CustomThemeParts }) {
  const {
    vis,
    isPortrait,
    nextIqamah,
    clock,
    masjidNameEl,
    dateBlock,
    sunTimes,
    prayerTable,
    countdownLabel,
    countdownPrayerName,
    countdownValue,
  } = parts;

  const showCountdown = nextIqamah && vis.nextIqamahCard;

  if (isPortrait) {
    return (
      <>
        {/* Top bar */}
        <div className='flex-shrink-0 px-[5cqw] py-[1.8cqh] grid grid-cols-3 items-center'>
          <div className='justify-self-start'>{dateBlock}</div>
          <div className='justify-self-center'>{clock}</div>
          <div className='flex flex-col items-end gap-[0.4cqh] justify-self-end text-right'>
            {masjidNameEl}
            {sunTimes(true)}
          </div>
        </div>

        {/* Prayer table */}
        {prayerTable({
          className: 'px-[4cqw] py-[1.5cqh]',
          headerPadY: 'py-[1.5cqh]',
          padX: 'px-[3cqw]',
          accent: true,
        })}

        {/* Next Iqamah */}
        {showCountdown && (
          <div className='flex-shrink-0 px-[4cqw] pb-[2cqh]'>
            <div className='bg-white/10 rounded-xl py-[2.5cqh] flex items-center justify-center gap-[4cqw]'>
              <div className='flex flex-col items-center'>
                {countdownLabel}
                {countdownPrayerName}
              </div>
              <div className='w-[1px] h-[5cqh] bg-white/30' />
              {countdownValue('gap-[1.5cqw]')}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Top bar */}
      <div className='flex-shrink-0 px-[3cqw] py-[1.2cqh] grid grid-cols-3 items-center'>
        <div className='justify-self-start'>{dateBlock}</div>
        <div className='justify-self-center'>{clock}</div>
        <div className='flex flex-col items-end gap-[0.3cqh] justify-self-end text-right'>
          {masjidNameEl}
          {sunTimes(false)}
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex flex-row px-[2.5cqw] py-[1.5cqh] gap-[2cqw] min-h-0'>
        <div className='flex-[3] flex flex-col min-h-0'>
          {prayerTable({ headerPadY: 'py-[1cqh]', padX: 'px-[1.5cqw]', accent: true })}
        </div>

        {showCountdown && (
          <div className='flex-[1] flex items-center justify-center'>
            <div className='bg-white/10 rounded-2xl flex flex-col items-center justify-center w-full h-[70%] px-[1cqw]'>
              {countdownLabel}
              <div className='mt-[0.3cqh]'>{countdownPrayerName}</div>
              <div className='w-[60%] h-[1px] bg-white/30 my-[1cqh]' />
              {countdownValue('gap-[0.4cqw]')}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
