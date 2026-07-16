import type { ThemeProps } from '../types';
import { useCustomThemeParts } from './parts';
import { TableLayout } from './layouts/table';
import { CardsLayout } from './layouts/cards';
import { SpotlightLayout } from './layouts/spotlight';

/**
 * Custom theme — renders one of several arrangements over a user-chosen
 * background, applying the per-screen font family / size multipliers / semantic
 * color slots / element visibility.
 *
 * `layout` picks the arrangement and nothing else: every other setting is
 * resolved once here, in `useCustomThemeParts`, and handed to whichever layout
 * is chosen. Layouts compose those pieces and never read the config, so a new
 * setting reaches all of them at once and a new layout inherits all of them for
 * free.
 */
export function Theme4(props: ThemeProps) {
  const parts = useCustomThemeParts(props);

  switch (parts.cfg.layout) {
    case 'cards':
      return parts.root(<CardsLayout parts={parts} />);
    case 'spotlight':
      return parts.root(<SpotlightLayout parts={parts} />);
    case 'table':
    default:
      return parts.root(<TableLayout parts={parts} />);
  }
}
