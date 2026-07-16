import type { CustomThemeParts } from '../parts';

/**
 * The countdown as the hero. Where the table treats every prayer equally and
 * tucks the countdown into a corner card, this inverts the emphasis: the time
 * remaining is the biggest thing on the screen, and the full prayer list demotes
 * to a reference panel beside it.
 *
 * Everything that isn't the prayer times — masjid name, clock, countdown, dates,
 * sun times — gathers in the hero pane, leaving the other pane as nothing but
 * the table. The split is by kind, so neither pane mixes the two.
 *
 * The hero drops to whatever is left when parts of it are switched off, or once
 * the last iqamah of the day has passed — it rebuilds rather than collapsing.
 */
export function SpotlightLayout({ parts }: { parts: CustomThemeParts }) {
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

  const hero = (
    <div className='flex flex-col items-center justify-center text-center gap-[0.8cqh] min-w-0'>
      {masjidNameEl}
      {clock}
      {showCountdown && (
        <div className={`flex flex-col items-center ${isPortrait ? 'mt-[2cqh]' : 'mt-[1.5cqh]'}`}>
          {countdownLabel}
          {countdownPrayerName}
          <div className={isPortrait ? 'mt-[1cqh]' : 'mt-[0.8cqh]'}>
            {countdownValue(isPortrait ? 'gap-[1.5cqw]' : 'gap-[0.5cqw]')}
          </div>
        </div>
      )}
    </div>
  );

  // Sunrise/sunset side by side rather than stacked: the hero pane is wide enough
  // for both, and a centred pair sits under the countdown better than a column.
  const sun = sunTimes(false);
  // Nothing to pin to the foot of the hero once the dates and sun times are off,
  // so drop the row entirely instead of leaving its spacing behind.
  const info =
    dateBlock || sun ? (
      <div className='flex flex-col items-center text-center gap-[0.4cqh]'>
        {dateBlock}
        {sun}
      </div>
    ) : null;

  // Switching off the masjid name, clock, countdown, dates and sun times leaves
  // the hero with nothing in it — a legitimate "just the times" setup. Hand the
  // whole screen to the table rather than holding a pane open around no content.
  const heroHasContent = Boolean(masjidNameEl || clock || showCountdown || info);

  if (!heroHasContent) {
    return (
      <div
        className={`flex-1 flex flex-col min-h-0 ${
          isPortrait ? 'px-[4cqw] py-[2cqh]' : 'px-[2.5cqw] py-[4cqh]'
        }`}
      >
        {prayerTable({
          headerPadY: isPortrait ? 'pb-[1cqh]' : 'pb-[0.8cqh]',
          padX: isPortrait ? 'px-[2cqw]' : 'px-[1cqw]',
        })}
      </div>
    );
  }

  if (isPortrait) {
    return (
      <>
        {/* Hero — takes the upper half, where the eye lands first */}
        <div className='flex-[5] flex flex-col min-h-0 px-[5cqw] py-[2cqh]'>
          <div className='flex-1 flex flex-col justify-center min-h-0'>{hero}</div>
          {info && <div className='flex-shrink-0 pt-[1.5cqh]'>{info}</div>}
        </div>

        {/* Reference panel */}
        <div className='flex-[4] flex flex-col min-h-0 px-[4cqw] pt-[1.5cqh] pb-[2cqh]'>
          {prayerTable({ headerPadY: 'pb-[1cqh]', padX: 'px-[2cqw]' })}
        </div>
      </>
    );
  }

  return (
    <div className='flex-1 flex flex-row min-h-0'>
      <div className='flex-[4] flex flex-col min-h-0 px-[2.5cqw] py-[1.5cqh]'>
        <div className='flex-1 flex flex-col justify-center min-h-0'>{hero}</div>
        {info && <div className='flex-shrink-0 pt-[1cqh]'>{info}</div>}
      </div>

      <div className='w-[1px] bg-white/20 my-[4cqh]' />

      {/* Inset to the same depth as the divider: with the dates and sun times
          gathered into the hero, nothing sits above the table to hold it off the
          top edge, and the header would otherwise start flush against it. */}
      <div className='flex-[5] flex flex-col min-h-0 px-[2.5cqw] py-[4cqh]'>
        {prayerTable({ headerPadY: 'pb-[0.8cqh]', padX: 'px-[1cqw]' })}
      </div>
    </div>
  );
}
