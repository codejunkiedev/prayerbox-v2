import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { CustomThemeBannerSpeed } from '@/types';

/**
 * Scroll speed, in container widths per second. Expressed relative to the
 * container rather than in absolute px/s so the settings preview scrolls at the
 * same *perceived* speed as the TV it stands in for — on any one screen the
 * container never changes size, so this is a constant px/s there.
 */
const WIDTHS_PER_SECOND: Record<CustomThemeBannerSpeed, number> = {
  slow: 0.05,
  normal: 0.09,
  fast: 0.16,
};

/** Blank space after the text before it repeats, as a fraction of the container. */
const GAP_FRACTION = 0.2;

interface ScrollingBannerProps {
  /** Plain text; newlines collapse to spaces since the ticker is one line. */
  text: string;
  direction: 'ltr' | 'rtl';
  speed: CustomThemeBannerSpeed;
  fontFamily: string;
  /** Font size as a CSS length — a container-query unit, like the rest of the theme. */
  fontSize: string;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number;
  /** Vertical padding as a CSS length; sets the banner's height with the text. */
  paddingBlock: string;
}

/**
 * A news-channel style ticker: text scrolls in a seamless loop at a constant
 * pixel-per-second speed, so a short announcement crawls by at the same pace as
 * a long one instead of whipping past. Text that fits the width does not scroll
 * at all — it renders static and centered.
 *
 * The scroll is a pure CSS transform animation, never a per-frame JS write, so
 * it runs on the compositor and holds up on low-end Android TV boxes next to a
 * live clock and countdown. JS only measures, and only when something changes.
 */
export function ScrollingBanner({
  text,
  direction,
  speed,
  fontFamily,
  fontSize,
  color,
  backgroundColor,
  backgroundOpacity,
  paddingBlock,
}: ScrollingBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [{ containerWidth, textWidth }, setMetrics] = useState({ containerWidth: 0, textWidth: 0 });

  // One ResizeObserver over the container and the text covers the geometry
  // inputs that change after mount — container resize, text edits, and size
  // multiplier changes.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const textElement = textRef.current;
    if (!container || !textElement) return;

    const measure = () => {
      const next = {
        containerWidth: container.clientWidth,
        textWidth: textElement.getBoundingClientRect().width,
      };
      setMetrics(prev =>
        prev.containerWidth === next.containerWidth && prev.textWidth === next.textWidth
          ? prev
          : next
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(textElement);

    // A web font swapping in changes the text width, and that reflow does not
    // reliably reach the observer — left alone, the speed stays pinned to the
    // fallback font's metrics and the ticker runs several percent fast forever.
    // `loadingdone` covers both the first paint and a later switch to a family
    // that has not been fetched yet; `ready` closes the gap if the fonts landed
    // between the measure above and this listener. Re-measuring costs nothing
    // when nothing moved.
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });
    document.fonts.addEventListener('loadingdone', measure);

    return () => {
      cancelled = true;
      observer.disconnect();
      document.fonts.removeEventListener('loadingdone', measure);
    };
  }, []);

  const gap = containerWidth * GAP_FRACTION;
  const shouldScroll = containerWidth > 0 && textWidth > containerWidth;
  // A loop travels one copy plus its trailing gap. Dividing that distance by the
  // target speed is what keeps px/s constant across texts of any length.
  const duration = shouldScroll
    ? (textWidth + gap) / (containerWidth * WIDTHS_PER_SECOND[speed])
    : 0;

  const textStyle: CSSProperties = { fontFamily, fontSize, color };

  // The gap sits on the wrapper, not the text, so the measured width stays the
  // text's own — otherwise the gap would feed back into the overflow test.
  const copy = (isMeasured: boolean) => (
    <div
      className='flex shrink-0'
      style={{ paddingInlineEnd: shouldScroll ? `${gap}px` : undefined }}
      aria-hidden={!isMeasured}
    >
      <span
        ref={isMeasured ? textRef : undefined}
        dir={direction}
        className='whitespace-nowrap'
        style={textStyle}
      >
        {text}
      </span>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className='relative w-full flex-shrink-0 overflow-hidden'
      style={{ paddingBlock }}
    >
      {/* Own layer, mirroring the theme's overlay: tinting the banner element
          itself would fade the text along with the background. */}
      <div className='absolute inset-0' style={{ backgroundColor, opacity: backgroundOpacity }} />

      {/* The track is pinned ltr so the two copies always lay out left-to-right
          regardless of ambient direction; the text carries the real direction,
          and RTL scrolls the other way by running the same loop in reverse. */}
      <div
        dir='ltr'
        className={
          shouldScroll
            ? 'relative flex w-max animate-banner-marquee'
            : 'relative flex justify-center'
        }
        style={
          shouldScroll
            ? {
                animationDuration: `${duration}s`,
                animationDirection: direction === 'rtl' ? 'reverse' : 'normal',
              }
            : undefined
        }
      >
        {copy(true)}
        {shouldScroll && copy(false)}
      </div>
    </div>
  );
}
