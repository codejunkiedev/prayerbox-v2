import { forwardRef, useEffect, useRef, useState } from 'react';
import { CANVAS_DIMENSIONS, HADITH_BOOKS, SURAHS } from '@/constants';
import type {
  AyatHadithCachedText,
  AyatHadithStyle,
  AyatHadithType,
  AyatSource,
  HadithSource,
  ScreenOrientation,
} from '@/types';
import { hexWithOpacity, resolveBackground, resolveFont } from './helpers';

interface CanvasProps {
  orientation: ScreenOrientation;
  type: AyatHadithType;
  source: AyatSource | HadithSource;
  style: AyatHadithStyle;
  cachedText: AyatHadithCachedText;
  showUrdu: boolean;
  showEnglish: boolean;
}

function resolveSourceLine(type: AyatHadithType, source: AyatSource | HadithSource): string | null {
  if (type === 'ayat') {
    const s = source as AyatSource;
    const surah = SURAHS.find(x => x.number === s.surah);
    if (!surah) return null;
    return `سُورَة ${surah.name_arabic} - ${surah.name_english} (Ch. ${surah.number})`;
  }
  const h = source as HadithSource;
  const book = HADITH_BOOKS.find(b => b.slug === h.book);
  if (!book || !h.hadith_number) return null;
  return `${book.name_arabic} - ${book.name} (#${h.hadith_number})`;
}

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  { orientation, type, source, style, cachedText, showUrdu, showEnglish },
  ref
) {
  const [width, height] = CANVAS_DIMENSIONS[orientation];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recalc = () => {
      const bounds = container.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;
      const s = Math.min(bounds.width / width, bounds.height / height);
      setScale(s);
    };

    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(container);
    return () => ro.disconnect();
  }, [width, height]);

  const bg = resolveBackground(style.background_id);
  const arabicFont = resolveFont('arabic', style.arabic.font_id);
  const urduFont = resolveFont('urdu', style.urdu.font_id);
  const englishFont = resolveFont('english', style.english.font_id);
  const sourceLine = resolveSourceLine(type, source);

  const backgroundStyle: React.CSSProperties = (() => {
    if (bg.type === 'image') {
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (bg.type === 'gradient') return { backgroundImage: bg.value };
    return { backgroundColor: bg.value };
  })();

  return (
    <div
      ref={containerRef}
      className='relative w-full h-full flex items-center justify-center overflow-hidden rounded-md'
    >
      <div
        ref={ref}
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'relative',
          flexShrink: 0,
          padding: '6%',
          ...backgroundStyle,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '6%',
            left: '6%',
            right: '6%',
            color: style.arabic.color,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4em',
          }}
        >
          <div
            style={{
              fontFamily: englishFont.family,
              fontSize: Math.round(style.english.size * 0.85),
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            I made this on <span style={{ fontWeight: 800 }}>PrayerBox</span>
          </div>
          {sourceLine && (
            <div
              style={{
                fontFamily: englishFont.family,
                fontSize: Math.round(style.english.size * 0.7),
                opacity: 0.9,
                lineHeight: 1.2,
              }}
            >
              {sourceLine}
            </div>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            right: '10%',
            transform: 'translateY(-50%)',
            padding: '4% 5%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3%',
            textAlign: 'center',
            overflow: 'hidden',
            borderRadius: 16,
            backgroundColor: hexWithOpacity(style.overlay_color, style.overlay_opacity),
          }}
        >
          {cachedText.arabic && (
            <div
              dir='rtl'
              style={{
                fontFamily: arabicFont.family,
                fontSize: style.arabic.size,
                color: style.arabic.color,
                lineHeight: style.arabic.line_height,
                fontWeight: 700,
              }}
            >
              {cachedText.arabic}
            </div>
          )}
          {showUrdu && cachedText.urdu?.text && (
            <div
              dir='rtl'
              style={{
                fontFamily: urduFont.family,
                fontSize: style.urdu.size,
                color: style.urdu.color,
                lineHeight: style.urdu.line_height,
              }}
            >
              {cachedText.urdu.text}
            </div>
          )}
          {showEnglish && cachedText.english?.text && (
            <div
              style={{
                fontFamily: englishFont.family,
                fontSize: style.english.size,
                color: style.english.color,
                lineHeight: style.english.line_height,
              }}
            >
              {cachedText.english.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
