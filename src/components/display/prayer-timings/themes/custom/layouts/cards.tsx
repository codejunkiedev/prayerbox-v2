import type { ProcessedPrayerTiming } from '@/types';
import type { CustomThemeParts } from '../parts';

/**
 * One card per prayer, under a single-line countdown ribbon. The table's rows
 * and column headers become a grid of self-contained tiles: each card repeats
 * the Starts/Athan/Iqamah labels beside its own times, so the eye finds one
 * prayer as a unit instead of tracking across a row.
 *
 * Landscape gives every prayer its own column, so the grid must stay legible at
 * the widest it ever gets — Friday with three Jumma entries, i.e. 7 across.
 * Portrait pairs them up instead, since 7 columns on a 9:16 screen would leave
 * each one too narrow to read from the back of a hall.
 */
export function CardsLayout({ parts }: { parts: CustomThemeParts }) {
  const {
    vis,
    isPortrait,
    dir,
    color,
    timeColumns,
    displayPrayers,
    nextIqamah,
    clock,
    masjidNameEl,
    dateBlock,
    sunTimes,
    columnHeader,
    columnLabel,
    timeCell,
    prayerName,
    countdownLabel,
    countdownPrayerName,
    countdownValue,
  } = parts;

  const showCountdown = nextIqamah && vis.nextIqamahCard;

  // Portrait pairs the cards up, so an odd count would leave a hole beside the
  // last one — which is the ordinary case, five prayers. Widening it to the full
  // row closes the gap and reads as deliberate.
  const spansRow = (index: number) =>
    isPortrait && displayPrayers.length % 2 === 1 && index === displayPrayers.length - 1;

  const card = (prayer: ProcessedPrayerTiming, index: number) => {
    const isNext = nextIqamah?.name === prayer.name;
    const wide = spansRow(index);
    return (
      <div
        key={prayer.name}
        dir={dir}
        className='flex flex-col rounded-xl overflow-hidden min-w-0'
        style={{
          backgroundColor: isNext ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${isNext ? color('times') : 'rgba(255,255,255,0.12)'}`,
          gridColumn: wide ? 'span 2' : undefined,
        }}
      >
        <div className='w-full text-center border-b border-white/10 py-[0.8cqh] px-[0.4cqw]'>
          {prayerName(prayer.name)}
        </div>
        {/* A card widened to the full row has the space to run its times across
            rather than down, which keeps its height in line with its neighbours. */}
        <div
          className={`flex-1 w-full flex justify-evenly py-[0.8cqh] px-[0.4cqw] ${
            wide ? 'flex-row items-center' : 'flex-col items-center'
          }`}
        >
          {timeColumns.map(col => (
            <div key={col} className='flex flex-col items-center'>
              {columnHeader(columnLabel(col), true)}
              {timeCell(prayer[col])}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ribbon = showCountdown && (
    <div className={`flex-shrink-0 ${isPortrait ? 'px-[4cqw]' : 'px-[2.5cqw]'}`}>
      <div
        dir={dir}
        className={`bg-white/10 rounded-xl flex items-center justify-center ${
          isPortrait ? 'py-[1.5cqh] gap-[3cqw]' : 'py-[1cqh] gap-[1.5cqw]'
        }`}
      >
        {countdownLabel}
        <div className={`w-[1px] bg-white/30 ${isPortrait ? 'h-[3cqh]' : 'h-[2.5cqh]'}`} />
        {countdownPrayerName}
        <div className={`w-[1px] bg-white/30 ${isPortrait ? 'h-[3cqh]' : 'h-[2.5cqh]'}`} />
        {countdownValue(isPortrait ? 'gap-[1.2cqw]' : 'gap-[0.4cqw]')}
      </div>
    </div>
  );

  const grid = (
    <div
      className={`flex-1 grid min-h-0 ${
        isPortrait ? 'px-[4cqw] py-[1.5cqh] gap-[2.5cqw]' : 'px-[2.5cqw] py-[1.5cqh] gap-[1cqw]'
      }`}
      style={{
        gridTemplateColumns: isPortrait
          ? 'repeat(2, minmax(0, 1fr))'
          : `repeat(${displayPrayers.length}, minmax(0, 1fr))`,
      }}
    >
      {displayPrayers.map(card)}
    </div>
  );

  if (isPortrait) {
    return (
      <>
        <div className='flex-shrink-0 px-[5cqw] py-[1.8cqh] flex flex-col items-center gap-[0.6cqh]'>
          {masjidNameEl}
          {clock}
          <div className='w-full flex items-center justify-between gap-[2cqw]'>
            {dateBlock}
            {sunTimes(true)}
          </div>
        </div>
        {ribbon}
        {grid}
      </>
    );
  }

  return (
    <>
      <div className='flex-shrink-0 px-[3cqw] py-[1.2cqh] grid grid-cols-3 items-center'>
        <div className='justify-self-start'>{dateBlock}</div>
        <div className='justify-self-center'>{clock}</div>
        <div className='flex flex-col items-end gap-[0.3cqh] justify-self-end text-right'>
          {masjidNameEl}
          {sunTimes(false)}
        </div>
      </div>
      {ribbon}
      {grid}
    </>
  );
}
