import type { CSSProperties, ReactNode } from 'react';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { getTimeBeforeNextIqamah, formatTimeNumber } from '@/utils';
import type { ThemeProps } from '../types';
import {
  Theme,
  type CustomThemeConfig,
  type CustomThemeTextGroup,
  type CustomThemeVisibility,
  type DisplayLanguage,
  type PrayerAdjustments,
  type ProcessedPrayerTiming,
} from '@/types';
import { backgroundCss, resolveCustomTheme, resolveFont, resolveFontById } from '@/helpers';
import { CurrentTime, ScrollingBanner } from '@/components/display/shared';
import { getDir, getFontClass } from '@/i18n';
import { BASE_SIZES, type SizeSlot } from './base-sizes';

/** The three optional prayer-time columns, in the order they are ever shown. */
export type TimeColumn = 'starts' | 'athan' | 'iqamah';

const COLUMN_LABEL_KEY: Record<TimeColumn, string> = {
  starts: 'prayer.columns.starts',
  athan: 'prayer.columns.athan',
  iqamah: 'prayer.columns.iqamah',
};

const JUMMA_NAMES = [
  'jumma1',
  'jumma2',
  'jumma3',
] as const satisfies readonly (keyof PrayerAdjustments & keyof CustomThemeVisibility)[];

const isJumma = (name: keyof PrayerAdjustments) => name.startsWith('jumma');

type NextIqamah = ReturnType<typeof getTimeBeforeNextIqamah>;

export interface PrayerTableOptions {
  /** Extra classes for the outer column, e.g. the layout's own padding. */
  className?: string;
  /** Vertical padding class for the header row. */
  headerPadY: string;
  /** Horizontal padding class shared by the header and the rows. */
  padX: string;
  /**
   * Draws a bar on the leading edge of the next prayer's row. Suits a table that
   * carries the screen; a layout that already spells the next prayer out in a
   * countdown hero can leave it off and keep the tint alone.
   */
  accent?: boolean;
}

/**
 * Everything a custom-theme layout needs, with every user setting already
 * applied. Layouts compose these; they never read the config directly, which is
 * what keeps a setting from silently applying to one arrangement and not
 * another.
 */
export interface CustomThemeParts {
  cfg: CustomThemeConfig;
  vis: CustomThemeVisibility;
  isPortrait: boolean;
  dir: 'ltr' | 'rtl';
  /** Tailwind font class for the rendered language; pair with `primaryFamily`. */
  fontClass: string;
  isEnglish: boolean;
  t: TFunction;
  /** The user's font for the rendered language — for prose and prayer names. */
  primaryFamily: string;
  /** The user's English font — for digits, which are Latin in every language. */
  englishFamily: string;
  /** Font size for a slot, as `base × global scale × the group's multiplier`. */
  fs: (slot: SizeSlot, group: CustomThemeTextGroup) => string;
  /** The group's colour, falling back to the global colour. */
  color: (group: CustomThemeTextGroup) => string;

  /** Visible time columns, already filtered by the visibility settings. */
  timeColumns: TimeColumn[];
  /** Grid template for a prayer-name column plus one track per visible column. */
  gridTemplateColumns: string;
  /** The prayers to show, Jumma-aware, in display order. */
  displayPrayers: ProcessedPrayerTiming[];
  nextIqamah: NextIqamah;

  /** Null when the corresponding element is switched off, so layouts can skip it. */
  clock: ReactNode;
  masjidNameEl: ReactNode;
  dateBlock: ReactNode;
  /**
   * Sunrise, Ishraq, Chasht and sunset — whichever are switched on, in the order
   * the sun reaches them. `stacked` runs them vertically instead of side by side.
   */
  sunTimes: (stacked: boolean) => ReactNode;

  columnHeader: (label: string, center?: boolean) => ReactNode;
  columnLabel: (col: TimeColumn) => string;
  timeCell: (time: string) => ReactNode;
  prayerName: (name: keyof PrayerAdjustments) => ReactNode;
  /**
   * A header row plus one row per prayer, sharing a column template so they stay
   * aligned. Shared by the layouts that show a table rather than tiles, so the
   * next prayer is highlighted the same way in each.
   */
  prayerTable: (opts: PrayerTableOptions) => ReactNode;

  countdownLabel: ReactNode;
  countdownPrayerName: ReactNode;
  /** The hours/minutes readout; `gap` is a Tailwind class for the unit spacing. */
  countdownValue: (gap: string) => ReactNode;

  /** Background, overlay and banner chrome — identical across layouts. */
  root: (children: ReactNode) => ReactNode;
}

/**
 * Resolves a screen's custom-theme config into ready-to-render pieces. Called
 * once per render by `Theme4`, which hands the result to the chosen layout.
 */
export function useCustomThemeParts({
  gregorianDate,
  hijriDate,
  sunrise,
  sunset,
  ishraq,
  chasht,
  currentTime,
  timeZone,
  processedPrayerTimings,
  isFriday,
  orientation,
  masjidName,
  contactDetails,
  customTheme,
  previewLanguage,
}: ThemeProps): CustomThemeParts {
  // Normalized rather than defaulted: a theme saved before a control shipped is
  // non-null but missing that control's keys. Memoized because this rebuilds the
  // config and the clock re-renders the theme every second.
  const cfg = useMemo(() => resolveCustomTheme(customTheme), [customTheme]);
  const vis = cfg.visibility;
  const isPortrait = orientation === 'portrait';
  const S = BASE_SIZES[cfg.layout][isPortrait ? 'portrait' : 'landscape'];

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
  // Primary text uses the per-language font the user chose: English on English,
  // Arabic on Arabic, Urdu on Urdu.
  const primaryFamily = isEnglish ? englishFamily : lang === 'ar' ? arabicFamily : urduFamily;

  // Container-query width units (cqw) so a layout scales to its container,
  // letting it render full-screen on the display and inside the editor preview.
  const fs = (slot: SizeSlot, group: CustomThemeTextGroup): string =>
    `${(S[slot] * cfg.size.scale * cfg.size.groups[group]).toFixed(3)}cqw`;
  const color = (group: CustomThemeTextGroup) => cfg.colors.overrides[group] ?? cfg.colors.global;

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
  // it, oversized text would grow tracks by content and drift a header out of
  // alignment with the rows beneath it.
  const gridTemplateColumns = `minmax(0, 2.5fr) ${timeColumns
    .map(() => 'minmax(0, 1fr)')
    .join(' ')}`;

  const displayPrayers = useMemo(() => {
    const base: (keyof PrayerAdjustments)[] = ['fajr', 'dhuhr'];
    if (vis.jummaTimes) base.push(...JUMMA_NAMES.filter(name => vis[name]));
    base.push('asr', 'maghrib', 'isha');
    return base
      .map(name => processedPrayerTimings.find(p => p.name === name))
      .filter((p): p is ProcessedPrayerTiming => !!p);
  }, [processedPrayerTimings, vis]);

  const nextIqamah = useMemo(() => {
    const jummas = displayPrayers.filter(p => isJumma(p.name));
    const midday = isFriday && jummas.length ? 'dhuhr' : null;
    return getTimeBeforeNextIqamah(
      displayPrayers.filter(p => (midday ? p.name !== midday : !isJumma(p.name))),
      timeZone
    );
  }, [displayPrayers, isFriday, timeZone]);

  const solarRows = useMemo(
    () =>
      (
        [
          [vis.sunriseSunset, 'prayer.sunrise', sunrise, 'text-amber-400'],
          [vis.ishraq, 'prayer.ishraq', ishraq, 'text-yellow-300'],
          [vis.chasht, 'prayer.chasht', chasht, 'text-sky-300'],
          [vis.sunriseSunset, 'prayer.sunset', sunset, 'text-orange-400'],
        ] as const
      )
        .filter(([on]) => on)
        .map(([, key, time, tone]) => ({ key, tone, ...formatTimeNumber(time) })),
    [vis.sunriseSunset, vis.ishraq, vis.chasht, sunrise, ishraq, chasht, sunset]
  );

  const clock = vis.clock ? (
    <CurrentTime
      variant={Theme.Theme4}
      currentTime={currentTime}
      color={color('times')}
      fontFamily={englishFamily}
      numberFontSize={fs('clockNum', 'times')}
      amPmFontSize={fs('clockAmPm', 'times')}
    />
  ) : null;

  const sunRow = (labelKey: string, num: string, amPm: string, tone: string) => (
    <div key={labelKey} className='flex items-baseline' style={{ gap: fs('sunGap', 'date') }}>
      <span
        className={`uppercase font-medium ${fontClass}`}
        style={{
          fontSize: fs('sunLabel', 'date'),
          color: color('date'),
          fontFamily: primaryFamily,
        }}
      >
        {t(labelKey)}
      </span>
      <span className={`font-bold ${tone}`} style={{ fontSize: fs('sunNum', 'date') }}>
        {num}
      </span>
      <span className={`${tone} opacity-80`} style={{ fontSize: fs('sunAmPm', 'date') }}>
        {amPm}
      </span>
    </div>
  );

  const sunTimes = (stacked: boolean) => {
    if (solarRows.length === 0) return null;
    return (
      <div
        className={
          stacked
            ? 'flex flex-col items-end gap-[0.4cqh]'
            : 'grid grid-cols-2 gap-x-[2cqw] gap-y-[0.4cqh]'
        }
      >
        {solarRows.map(row => sunRow(row.key, row.timeNumber, row.amPm, row.tone))}
      </div>
    );
  };

  const trimmedMasjidName = masjidName?.trim();
  const masjidNameEl =
    vis.masjidName && trimmedMasjidName ? (
      <span
        dir={dir}
        className={`font-bold ${fontClass}`}
        style={{
          fontSize: fs('masjidName', 'masjidName'),
          color: color('masjidName'),
          fontFamily: primaryFamily,
          lineHeight: isEnglish ? 1.25 : 'normal',
        }}
      >
        {trimmedMasjidName}
      </span>
    ) : null;

  const dateBlock =
    vis.gregorianDate || vis.hijriDate ? (
      <div className='flex flex-col' dir={dir}>
        {vis.gregorianDate && (
          <span
            className={`font-semibold uppercase ${isEnglish ? 'tracking-wide ' : ''}${fontClass}`}
            style={{
              fontSize: fs('greg', 'date'),
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
            style={{ fontSize: fs('hijri', 'date'), color: color('date'), opacity: 0.85 }}
          >
            {hijriDate}
          </span>
        )}
      </div>
    ) : null;

  const columnHeader = (label: string, center = false) => (
    <span
      className={`font-bold uppercase ${isEnglish ? 'tracking-wider ' : ''}${fontClass}${
        center ? ' text-center' : ''
      }`}
      style={{
        fontSize: fs('colHeader', 'header'),
        color: color('header'),
        fontFamily: primaryFamily,
      }}
    >
      {label}
    </span>
  );

  const columnLabel = (col: TimeColumn) => t(COLUMN_LABEL_KEY[col]);

  // Times are Latin digits in every language, so this stays ltr and on the
  // English family regardless of the screen's language.
  const timeCell = (time: string) => {
    const { timeNumber, amPm } = formatTimeNumber(time);
    return (
      <div dir='ltr' className='flex items-baseline justify-center gap-[0.2cqw]'>
        <span
          className='font-bold'
          style={{
            fontSize: fs('timeNum', 'times'),
            color: color('times'),
            fontFamily: englishFamily,
          }}
        >
          {timeNumber}
        </span>
        <span
          className='font-medium uppercase'
          style={{
            fontSize: fs('timeAmPm', 'times'),
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

  const soleJumma = displayPrayers.filter(p => isJumma(p.name)).length === 1;
  const prayerLabel = (name: keyof PrayerAdjustments) =>
    t(`prayer.names.${soleJumma && isJumma(name) ? 'jumma' : name}`);

  const prayerName = (name: keyof PrayerAdjustments) => (
    <span
      className={`font-extrabold uppercase ${fontClass}`}
      style={{
        fontSize: fs('nameMain', 'names'),
        color: color('names'),
        fontFamily: primaryFamily,
      }}
    >
      {prayerLabel(name)}
    </span>
  );

  const prayerTable = ({
    className = '',
    headerPadY,
    padX,
    accent = false,
  }: PrayerTableOptions) => (
    <div className={`flex-1 flex flex-col min-h-0 ${className}`}>
      <div
        dir={dir}
        className={`flex-shrink-0 grid border-b border-white/20 ${headerPadY} ${padX}`}
        style={{ gridTemplateColumns }}
      >
        {columnHeader(t('prayer.columns.prayer'))}
        {timeColumns.map(col => (
          <Fragment key={col}>{columnHeader(columnLabel(col), true)}</Fragment>
        ))}
      </div>
      <div className='flex-1 flex flex-col rounded-b-xl overflow-hidden'>
        {displayPrayers.map(prayer => {
          const isNext = nextIqamah?.name === prayer.name;
          const rowStyle: CSSProperties = isNext
            ? {
                backgroundColor: 'rgba(255,255,255,0.10)',
                // The accent sits on the leading edge, which flips with the language.
                ...(accent
                  ? { [isEnglish ? 'borderLeft' : 'borderRight']: `4px solid ${color('times')}` }
                  : {}),
              }
            : {};
          return (
            <div
              key={prayer.name}
              dir={dir}
              className={`grid flex-1 items-center ${padX} border-b border-white/10 last:border-b-0`}
              style={{ ...rowStyle, gridTemplateColumns }}
            >
              <div className='flex items-center'>{prayerName(prayer.name)}</div>
              {timeColumns.map(col => (
                <Fragment key={col}>{timeCell(prayer[col])}</Fragment>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  const countdownLabel = (
    <span
      className={`font-bold uppercase ${fontClass}`}
      style={{
        fontSize: fs('ciLabel', 'countdown'),
        color: color('countdown'),
        opacity: 0.8,
        letterSpacing: isEnglish ? '0.2em' : undefined,
      }}
    >
      {t('prayer.nextIqamah')}
    </span>
  );

  const countdownPrayerName = nextIqamah ? (
    <span
      className={`font-semibold uppercase ${fontClass}`}
      style={{
        fontSize: fs('ciName', 'countdown'),
        color: color('countdown'),
        fontFamily: primaryFamily,
      }}
    >
      {prayerLabel(nextIqamah.name)}
    </span>
  ) : null;

  const countdownValue = (gap: string) => {
    if (!nextIqamah) return null;
    const bigStyle: CSSProperties = {
      fontSize: fs('ciBig', 'countdown'),
      color: color('countdown'),
      fontFamily: englishFamily,
    };
    const unitStyle: CSSProperties = {
      fontSize: fs('ciUnit', 'countdown'),
      color: color('countdown'),
      opacity: 0.8,
    };
    return (
      <div dir='ltr' className={`flex items-baseline ${gap}`}>
        {nextIqamah.hours > 0 && (
          <>
            <span className='font-black leading-none' style={bigStyle}>
              {nextIqamah.hours}
            </span>
            <span className={`font-bold uppercase ${fontClass}`} style={unitStyle}>
              {t('prayer.hr')}
            </span>
          </>
        )}
        <span className='font-black leading-none' style={bigStyle}>
          {nextIqamah.minutes}
        </span>
        <span className={`font-bold uppercase ${fontClass}`} style={unitStyle}>
          {t('prayer.min')}
        </span>
      </div>
    );
  };

  const bannerSegments = {
    text: [cfg.banner.text],
    contact: [contactDetails],
    both: [cfg.banner.text, contactDetails],
  }[cfg.banner.content]
    .map(segment => segment?.trim())
    .filter((segment): segment is string => Boolean(segment));

  const banner =
    cfg.banner.enabled && bannerSegments.length > 0 ? (
      <ScrollingBanner
        segments={bannerSegments}
        direction={cfg.banner.direction}
        speed={cfg.banner.speed}
        fontFamily={resolveFontById(cfg.banner.font).family}
        fontSize={fs('banner', 'banner')}
        color={color('banner')}
        backgroundColor={cfg.banner.background.color}
        backgroundOpacity={cfg.banner.background.opacity}
        paddingBlock={isPortrait ? '1.2cqh' : '1cqh'}
      />
    ) : null;

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
      <div className='relative z-10 w-full h-full flex flex-col'>
        {cfg.banner.position === 'top' && banner}
        {children}
        {cfg.banner.position === 'bottom' && banner}
      </div>
    </div>
  );

  return {
    cfg,
    vis,
    isPortrait,
    dir,
    fontClass,
    isEnglish,
    t,
    primaryFamily,
    englishFamily,
    fs,
    color,
    timeColumns,
    gridTemplateColumns,
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
    prayerTable,
    countdownLabel,
    countdownPrayerName,
    countdownValue,
    root,
  };
}
