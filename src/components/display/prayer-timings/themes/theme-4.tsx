import type { CSSProperties, ReactNode } from 'react';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getTimeBeforeNextIqamah,
  getFilteredJummaPrayerNames,
  isFridayPrayer,
  formatTimeNumber,
} from '@/utils';
import type { ThemeProps } from './types';
import {
  Theme,
  type CustomThemeConfig,
  type CustomThemeTextGroup,
  type DisplayLanguage,
  type PrayerAdjustments,
  type ProcessedPrayerTiming,
} from '@/types';
import { DEFAULT_CUSTOM_THEME } from '@/constants';
import { backgroundCss, resolveFont } from '@/helpers';
import { CurrentTime } from '@/components/display/shared';
import { getDir, getFontClass } from '@/i18n';

// Theme 3's base font sizes (in vw) per orientation. The custom theme scales
// these by the global scale × the per-group multiplier, preserving hierarchy.
const BASE_SIZES = {
  landscape: {
    greg: 1.3,
    hijri: 1.1,
    clockNum: 5,
    clockAmPm: 2,
    sunLabel: 0.9,
    sunNum: 1.3,
    sunAmPm: 0.7,
    colHeader: 1.3,
    nameMain: 1.7,
    nameArabic: 1.3,
    timeNum: 1.8,
    timeAmPm: 0.9,
    ciLabel: 0.9,
    ciName: 1.2,
    ciBig: 4.5,
    ciUnit: 1.1,
  },
  portrait: {
    greg: 3.2,
    hijri: 2.8,
    clockNum: 10,
    clockAmPm: 4,
    sunLabel: 2.2,
    sunNum: 3,
    sunAmPm: 1.8,
    colHeader: 3.2,
    nameMain: 4,
    nameArabic: 3.2,
    timeNum: 4,
    timeAmPm: 2.2,
    ciLabel: 2.5,
    ciName: 3,
    ciBig: 12,
    ciUnit: 3.5,
  },
} as const;

/**
 * Custom theme — reuses Theme 3's layout and typographic hierarchy as a fixed
 * base, but renders with transparent chrome over a user-chosen background, and
 * applies the per-screen font family / size multipliers / semantic color slots.
 */
export function Theme4({
  gregorianDate,
  hijriDate,
  sunrise,
  sunset,
  currentTime,
  processedPrayerTimings,
  prayerTimeSettings,
  orientation,
  customTheme,
  previewLanguage,
}: ThemeProps) {
  const cfg: CustomThemeConfig = customTheme ?? DEFAULT_CUSTOM_THEME;
  const vis = cfg.visibility;
  const isPortrait = orientation === 'portrait';
  const S = isPortrait ? BASE_SIZES.portrait : BASE_SIZES.landscape;

  // Follows the screen's Display Language, unless the editor forces a preview
  // language (which uses a language-bound `t` so the global i18n is untouched).
  const { t: globalT, i18n } = useTranslation();
  const lang: DisplayLanguage = previewLanguage ?? (i18n.language as DisplayLanguage);
  const t = previewLanguage ? i18n.getFixedT(previewLanguage) : globalT;
  const dir = getDir(lang);
  const fontClass = getFontClass(lang);
  const isEnglish = lang === 'en';

  const englishFamily = resolveFont('english', cfg.fonts.english).family;
  const arabicFamily = resolveFont('arabic', cfg.fonts.arabic).family;
  const urduFamily = resolveFont('urdu', cfg.fonts.urdu).family;

  // Effective font size for an element = base × global scale × group multiplier.
  // Container-query width units (cqw) so the theme scales to its container,
  // letting it render full-screen on the display and inside the settings preview.
  const fs = (baseVw: number, group: CustomThemeTextGroup): string =>
    `${(baseVw * cfg.size.scale * cfg.size.groups[group]).toFixed(3)}cqw`;
  const color = (group: CustomThemeTextGroup) => cfg.colors.overrides[group] ?? cfg.colors.global;
  // Primary text uses the per-language font the user chose: English on English,
  // Arabic on Arabic, Urdu on Urdu.
  const primaryFamily = isEnglish ? englishFamily : lang === 'ar' ? arabicFamily : urduFamily;

  // Visible time columns drive a dynamic grid template shared by the header and
  // every row, so hiding a column reflows the table without breaking alignment.
  // The prayer-name column (2.5fr) is always present.
  const timeColumns = (
    [
      ['starts', vis.columnStarts],
      ['athan', vis.columnAthan],
      ['iqamah', vis.columnIqamah],
    ] as const
  )
    .filter(([, on]) => on)
    .map(([col]) => col);
  // minmax(0, …) so columns keep their proportions at any text scale — without
  // it, oversized text would grow tracks by content and drift the header out of
  // alignment with the rows (both share this template).
  const gridTemplateColumns = `minmax(0, 2.5fr) ${timeColumns
    .map(() => 'minmax(0, 1fr)')
    .join(' ')}`;
  const columnLabelKey = {
    starts: 'prayer.columns.starts',
    athan: 'prayer.columns.athan',
    iqamah: 'prayer.columns.iqamah',
  } as const;

  const nextIqamah = useMemo(
    () => getTimeBeforeNextIqamah(processedPrayerTimings),
    [processedPrayerTimings]
  );

  const isFriday = useMemo(() => isFridayPrayer(undefined), []);

  const displayPrayers = useMemo(() => {
    const base: (keyof PrayerAdjustments)[] = ['fajr'];
    if (isFriday) {
      base.push(...getFilteredJummaPrayerNames(prayerTimeSettings));
    } else {
      base.push('dhuhr');
    }
    base.push('asr', 'maghrib', 'isha');
    return base
      .map(name => processedPrayerTimings.find(p => p.name === name))
      .filter((p): p is ProcessedPrayerTiming => !!p);
  }, [processedPrayerTimings, prayerTimeSettings, isFriday]);

  const { sunriseNum, sunriseAmPm } = useMemo(() => {
    const parsed = formatTimeNumber(sunrise);
    return { sunriseNum: parsed.timeNumber, sunriseAmPm: parsed.amPm };
  }, [sunrise]);

  const { sunsetNum, sunsetAmPm } = useMemo(() => {
    const parsed = formatTimeNumber(sunset);
    return { sunsetNum: parsed.timeNumber, sunsetAmPm: parsed.amPm };
  }, [sunset]);

  const clock = (
    <CurrentTime
      variant={Theme.Theme4}
      currentTime={currentTime}
      color={color('times')}
      fontFamily={englishFamily}
      numberFontSize={fs(S.clockNum, 'times')}
      amPmFontSize={fs(S.clockAmPm, 'times')}
    />
  );

  const sunRow = (
    label: string,
    num: string,
    amPm: string,
    numClass: string,
    amPmClass: string
  ) => (
    <div className='flex items-baseline gap-[0.4cqw]'>
      <span
        className={`uppercase font-medium ${fontClass}`}
        style={{
          fontSize: fs(S.sunLabel, 'date'),
          color: color('date'),
          fontFamily: primaryFamily,
        }}
      >
        {label}
      </span>
      <span className={`font-bold ${numClass}`} style={{ fontSize: fs(S.sunNum, 'date') }}>
        {num}
      </span>
      <span className={amPmClass} style={{ fontSize: fs(S.sunAmPm, 'date') }}>
        {amPm}
      </span>
    </div>
  );

  const colHeader = (text: string, center = false) => (
    <span
      className={`font-bold uppercase ${isEnglish ? 'tracking-wider ' : ''}${fontClass}${
        center ? ' text-center' : ''
      }`}
      style={{
        fontSize: fs(S.colHeader, 'header'),
        color: color('header'),
        fontFamily: primaryFamily,
      }}
    >
      {text}
    </span>
  );

  const renderTimeCell = (time: string) => {
    const { timeNumber, amPm } = formatTimeNumber(time);
    return (
      <div dir='ltr' className='flex items-baseline justify-center gap-[0.2cqw]'>
        <span
          className='font-bold'
          style={{
            fontSize: fs(S.timeNum, 'times'),
            color: color('times'),
            fontFamily: englishFamily,
          }}
        >
          {timeNumber}
        </span>
        <span
          className='font-medium uppercase'
          style={{
            fontSize: fs(S.timeAmPm, 'times'),
            color: color('times'),
            opacity: 0.6,
            fontFamily: englishFamily,
          }}
        >
          {amPm}
        </span>
      </div>
    );
  };

  const prayerNameCell = (name: keyof PrayerAdjustments, gap: string) => (
    <div className={`flex items-center ${gap}`} dir={dir}>
      <span
        className={`font-extrabold uppercase ${fontClass}`}
        style={{
          fontSize: fs(S.nameMain, 'names'),
          color: color('names'),
          fontFamily: primaryFamily,
        }}
      >
        {t(`prayer.names.${name}`)}
      </span>
    </div>
  );

  const rows = (rowPadX: string) => (
    <div className='flex-1 flex flex-col rounded-b-xl overflow-hidden'>
      {displayPrayers.map(prayer => {
        const isNext = nextIqamah?.name === prayer.name;
        const rowStyle: CSSProperties = isNext
          ? {
              backgroundColor: 'rgba(255,255,255,0.10)',
              [isEnglish ? 'borderLeft' : 'borderRight']: `4px solid ${color('times')}`,
            }
          : {};
        return (
          <div
            key={prayer.name}
            dir={dir}
            className={`grid flex-1 items-center ${rowPadX} border-b border-white/10 last:border-b-0`}
            style={{ ...rowStyle, gridTemplateColumns }}
          >
            {prayerNameCell(prayer.name, isPortrait ? 'gap-[2cqw]' : 'gap-[0.8cqw]')}
            {timeColumns.map(col => (
              <Fragment key={col}>{renderTimeCell(prayer[col])}</Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );

  const colHeaders = (headerPadY: string, headerPadX: string) => (
    <div
      dir={dir}
      className={`flex-shrink-0 grid border-b border-white/20 ${headerPadY} ${headerPadX}`}
      style={{ gridTemplateColumns }}
    >
      {colHeader(t('prayer.columns.prayer'))}
      {timeColumns.map(col => (
        <Fragment key={col}>{colHeader(t(columnLabelKey[col]), true)}</Fragment>
      ))}
    </div>
  );

  const ciLabel = (uppercaseTrack = false) => ({
    fontSize: fs(S.ciLabel, 'countdown'),
    color: color('countdown'),
    opacity: 0.8,
    letterSpacing: uppercaseTrack && isEnglish ? '0.2em' : undefined,
  });
  const ciUnitStyle: CSSProperties = {
    fontSize: fs(S.ciUnit, 'countdown'),
    color: color('countdown'),
    opacity: 0.8,
  };

  const root = (children: ReactNode) => (
    <div
      className='relative w-full h-full overflow-hidden select-none'
      style={{ ...backgroundCss(cfg.background), containerType: 'size' }}
    >
      {cfg.overlay.enabled && (
        <div
          className='absolute inset-0'
          style={{ backgroundColor: cfg.overlay.color, opacity: cfg.overlay.opacity }}
        />
      )}
      <div className='relative z-10 w-full h-full flex flex-col'>{children}</div>
    </div>
  );

  if (isPortrait) {
    return root(
      <>
        {/* Top bar */}
        <div className='flex-shrink-0 px-[5cqw] py-[1.8cqh] grid grid-cols-3 items-center'>
          <div className='flex flex-col justify-self-start' dir={dir}>
            {vis.gregorianDate && (
              <span
                className={`font-semibold uppercase ${isEnglish ? 'tracking-wide ' : ''}${fontClass}`}
                style={{
                  fontSize: fs(S.greg, 'date'),
                  color: color('date'),
                  fontFamily: primaryFamily,
                }}
              >
                {gregorianDate}
              </span>
            )}
            {vis.hijriDate && (
              <span
                className={`font-medium ${fontClass}`}
                style={{ fontSize: fs(S.hijri, 'date'), color: color('date'), opacity: 0.85 }}
              >
                {hijriDate}
              </span>
            )}
          </div>

          <div className='justify-self-center'>{vis.clock ? clock : null}</div>

          <div className='flex flex-col items-end gap-[0.4cqh] justify-self-end'>
            {vis.sunriseSunset && (
              <>
                {sunRow(
                  t('prayer.sunrise'),
                  sunriseNum,
                  sunriseAmPm,
                  'text-amber-400',
                  'text-amber-400/80'
                )}
                {sunRow(
                  t('prayer.sunset'),
                  sunsetNum,
                  sunsetAmPm,
                  'text-orange-400',
                  'text-orange-400/80'
                )}
              </>
            )}
          </div>
        </div>

        {/* Prayer table */}
        <div className='flex-1 flex flex-col min-h-0 px-[4cqw] py-[1.5cqh]'>
          {colHeaders('py-[1.5cqh]', 'px-[3cqw]')}
          {rows('px-[3cqw]')}
        </div>

        {/* Next Iqamah */}
        {nextIqamah && vis.nextIqamahCard && (
          <div className='flex-shrink-0 px-[4cqw] pb-[2cqh]'>
            <div className='bg-white/10 rounded-xl py-[2.5cqh] flex items-center justify-center gap-[4cqw]'>
              <div className='flex flex-col items-center'>
                <span className={`font-bold uppercase ${fontClass}`} style={ciLabel(true)}>
                  {t('prayer.nextIqamah')}
                </span>
                <span
                  className={`font-semibold uppercase ${fontClass}`}
                  style={{
                    fontSize: fs(S.ciName, 'countdown'),
                    color: color('countdown'),
                    fontFamily: primaryFamily,
                  }}
                >
                  {t(`prayer.names.${nextIqamah.name}`)}
                </span>
              </div>
              <div className='w-[1px] h-[5cqh] bg-white/30' />
              <div className='flex items-baseline gap-[1.5cqw]'>
                {nextIqamah.hours > 0 && (
                  <>
                    <span
                      className='font-black leading-none'
                      style={{ fontSize: fs(S.ciBig, 'countdown'), color: color('countdown') }}
                    >
                      {nextIqamah.hours}
                    </span>
                    <span className={`font-bold uppercase ${fontClass}`} style={ciUnitStyle}>
                      {t('prayer.hr')}
                    </span>
                  </>
                )}
                <span
                  className='font-black leading-none'
                  style={{ fontSize: fs(S.ciBig, 'countdown'), color: color('countdown') }}
                >
                  {nextIqamah.minutes}
                </span>
                <span className={`font-bold uppercase ${fontClass}`} style={ciUnitStyle}>
                  {t('prayer.min')}
                </span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Landscape layout
  return root(
    <>
      {/* Top bar */}
      <div className='flex-shrink-0 px-[3cqw] py-[1.2cqh] grid grid-cols-3 items-center'>
        <div className='flex flex-col justify-self-start' dir={dir}>
          {vis.gregorianDate && (
            <span
              className={`font-semibold uppercase ${isEnglish ? 'tracking-wide ' : ''}${fontClass}`}
              style={{
                fontSize: fs(S.greg, 'date'),
                color: color('date'),
                fontFamily: primaryFamily,
              }}
            >
              {gregorianDate}
            </span>
          )}
          {vis.hijriDate && (
            <span
              className={`font-medium ${fontClass}`}
              style={{ fontSize: fs(S.hijri, 'date'), color: color('date'), opacity: 0.85 }}
            >
              {hijriDate}
            </span>
          )}
        </div>

        <div className='justify-self-center'>{vis.clock ? clock : null}</div>

        <div className='flex items-center gap-[2cqw] justify-self-end'>
          {vis.sunriseSunset && (
            <>
              {sunRow(
                t('prayer.sunrise'),
                sunriseNum,
                sunriseAmPm,
                'text-amber-400',
                'text-amber-400/80'
              )}
              {sunRow(
                t('prayer.sunset'),
                sunsetNum,
                sunsetAmPm,
                'text-orange-400',
                'text-orange-400/80'
              )}
            </>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 flex flex-row px-[2.5cqw] py-[1.5cqh] gap-[2cqw] min-h-0'>
        {/* Prayer Table */}
        <div className='flex-[3] flex flex-col min-h-0'>
          {colHeaders('py-[1cqh]', 'px-[1.5cqw]')}
          {rows('px-[1.5cqw]')}
        </div>

        {/* Next Iqamah Card */}
        {nextIqamah && vis.nextIqamahCard && (
          <div className='flex-[1] flex items-center justify-center'>
            <div className='bg-white/10 rounded-2xl flex flex-col items-center justify-center w-full h-[70%] px-[1cqw]'>
              <span className={`font-bold uppercase ${fontClass}`} style={ciLabel(true)}>
                {t('prayer.nextIqamah')}
              </span>
              <span
                className={`font-semibold uppercase mt-[0.3cqh] ${fontClass}`}
                style={{
                  fontSize: fs(S.ciName, 'countdown'),
                  color: color('countdown'),
                  fontFamily: primaryFamily,
                }}
              >
                {t(`prayer.names.${nextIqamah.name}`)}
              </span>
              <div className='w-[60%] h-[1px] bg-white/30 my-[1cqh]' />
              <div className='flex items-baseline gap-[0.4cqw]'>
                {nextIqamah.hours > 0 && (
                  <>
                    <span
                      className='font-black leading-none'
                      style={{ fontSize: fs(S.ciBig, 'countdown'), color: color('countdown') }}
                    >
                      {nextIqamah.hours}
                    </span>
                    <span className={`font-bold uppercase ${fontClass}`} style={ciUnitStyle}>
                      {t('prayer.hr')}
                    </span>
                  </>
                )}
                <span
                  className='font-black leading-none'
                  style={{ fontSize: fs(S.ciBig, 'countdown'), color: color('countdown') }}
                >
                  {nextIqamah.minutes}
                </span>
                <span className={`font-bold uppercase ${fontClass}`} style={ciUnitStyle}>
                  {t('prayer.min')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
