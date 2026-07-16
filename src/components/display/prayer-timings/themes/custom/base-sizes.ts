import type { CustomThemeLayout } from '@/types';

/**
 * The two shapes a layout is drawn for. Narrower than `ScreenOrientation`, which
 * also has `mobile` — the custom theme has only ever branched on portrait vs.
 * not, so `mobile` uses the landscape sizes as it always has.
 */
type LayoutOrientation = 'landscape' | 'portrait';

/**
 * The named text slots every layout sizes. One shared set rather than one per
 * layout: the slots are semantic roles ("the prayer name", "the big countdown
 * number") that all three arrangements happen to need, and a shared set is what
 * lets `fs()` and the size multipliers stay layout-agnostic.
 */
export type SizeSlot =
  | 'greg'
  | 'hijri'
  | 'clockNum'
  | 'clockAmPm'
  | 'masjidName'
  | 'sunLabel'
  | 'sunNum'
  | 'sunAmPm'
  | 'sunGap'
  | 'colHeader'
  | 'nameMain'
  | 'timeNum'
  | 'timeAmPm'
  | 'ciLabel'
  | 'ciName'
  | 'ciBig'
  | 'ciUnit'
  | 'banner';

type SizeTable = Record<SizeSlot, number>;

/**
 * Each layout's base font sizes, in vw, per orientation. These are the sizes the
 * layout is drawn at before the user touches anything; the custom theme scales
 * them by the global scale × the per-group multiplier, so these values are what
 * set each arrangement's typographic hierarchy.
 *
 * They differ per layout because the same role occupies very different space in
 * each: a prayer name has a full table row in `table`, one column of a 7-up grid
 * in `cards`, and a compact side list in `spotlight`. Sizing them identically
 * would overflow the tighter arrangements.
 */
export const BASE_SIZES: Record<CustomThemeLayout, Record<LayoutOrientation, SizeTable>> = {
  // Theme 3's original values — the custom theme's first and default layout.
  table: {
    landscape: {
      greg: 1.3,
      hijri: 1.1,
      clockNum: 5,
      clockAmPm: 2,
      masjidName: 1.6,
      sunLabel: 0.9,
      sunNum: 1.3,
      sunAmPm: 0.7,
      sunGap: 0.4,
      colHeader: 1.3,
      nameMain: 1.7,
      timeNum: 1.8,
      timeAmPm: 0.9,
      ciLabel: 0.9,
      ciName: 1.2,
      ciBig: 4.5,
      ciUnit: 1.1,
      banner: 1.5,
    },
    portrait: {
      greg: 3.2,
      hijri: 2.8,
      clockNum: 10,
      clockAmPm: 4,
      masjidName: 3.4,
      sunLabel: 2.2,
      sunNum: 3,
      sunAmPm: 1.8,
      sunGap: 1,
      colHeader: 3.2,
      nameMain: 4,
      timeNum: 4,
      timeAmPm: 2.2,
      ciLabel: 2.5,
      ciName: 3,
      ciBig: 12,
      ciUnit: 3.5,
      banner: 3.4,
    },
  },
  // Sized for the worst case the grid must hold: Friday with three Jumma
  // entries, i.e. 7 cards across in landscape and a 2-wide grid in portrait.
  cards: {
    landscape: {
      greg: 1.2,
      hijri: 1,
      clockNum: 3.6,
      clockAmPm: 1.5,
      masjidName: 1.5,
      sunLabel: 0.8,
      sunNum: 1.1,
      sunAmPm: 0.6,
      sunGap: 0.35,
      colHeader: 0.8,
      nameMain: 1.5,
      timeNum: 1.5,
      timeAmPm: 0.7,
      ciLabel: 1,
      ciName: 1.5,
      ciBig: 2.4,
      ciUnit: 1,
      banner: 1.5,
    },
    portrait: {
      greg: 2.8,
      hijri: 2.4,
      clockNum: 7.5,
      clockAmPm: 3,
      masjidName: 3,
      sunLabel: 1.8,
      sunNum: 2.4,
      sunAmPm: 1.4,
      sunGap: 0.8,
      colHeader: 1.9,
      nameMain: 3.4,
      timeNum: 3.2,
      timeAmPm: 1.6,
      ciLabel: 2,
      ciName: 2.8,
      ciBig: 5.5,
      ciUnit: 2,
      banner: 3.4,
    },
  },
  // The countdown carries the screen, so `ciBig` dwarfs everything; the prayer
  // list is a supporting reference and sizes down accordingly.
  spotlight: {
    landscape: {
      greg: 1.1,
      hijri: 0.95,
      clockNum: 4.2,
      clockAmPm: 1.7,
      masjidName: 1.9,
      sunLabel: 0.8,
      sunNum: 1.1,
      sunAmPm: 0.6,
      sunGap: 0.35,
      colHeader: 0.95,
      nameMain: 1.4,
      timeNum: 1.4,
      timeAmPm: 0.7,
      ciLabel: 1.1,
      ciName: 2,
      ciBig: 7,
      ciUnit: 1.5,
      banner: 1.5,
    },
    portrait: {
      greg: 2.6,
      hijri: 2.2,
      clockNum: 8,
      clockAmPm: 3.2,
      masjidName: 3.6,
      sunLabel: 1.8,
      sunNum: 2.4,
      sunAmPm: 1.4,
      sunGap: 0.8,
      colHeader: 2.2,
      nameMain: 3,
      timeNum: 3,
      timeAmPm: 1.6,
      ciLabel: 2.4,
      ciName: 3.6,
      ciBig: 15,
      ciUnit: 3,
      banner: 3.4,
    },
  },
};
