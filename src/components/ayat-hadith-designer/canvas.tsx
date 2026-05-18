import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import Moveable from 'react-moveable';
import { CANVAS_DIMENSIONS } from '@/constants';
import type {
  AyatHadithBox,
  AyatHadithCachedText,
  AyatHadithLayerKey,
  AyatHadithPositions,
  AyatHadithStyle,
  ScreenOrientation,
} from '@/types';
import { backgroundCss, resolveFont } from './helpers';
import { OverlayLayer, ReferenceLayer, TextLayer } from './layers';

interface CanvasProps {
  orientation: ScreenOrientation;
  style: AyatHadithStyle;
  cachedText: AyatHadithCachedText;
  showUrdu: boolean;
  showEnglish: boolean;
  showReference: boolean;
  selected: AyatHadithLayerKey | null;
  onSelectedChange: (next: AyatHadithLayerKey | null) => void;
  onPositionsChange: (next: AyatHadithPositions) => void;
  /** When true, hides selection outlines + Moveable controls (used for snapshot). */
  snapshotMode?: boolean;
}

const SELECTABLE_LAYERS: AyatHadithLayerKey[] = [
  'overlay',
  'arabic',
  'urdu',
  'english',
  'reference',
];

const MIN_LAYER_SIZE_PX = 20;

export const Canvas = forwardRef<HTMLDivElement, CanvasProps>(function Canvas(
  {
    orientation,
    style,
    cachedText,
    showUrdu,
    showEnglish,
    showReference,
    selected,
    onSelectedChange,
    onPositionsChange,
    snapshotMode,
  },
  ref
) {
  const [width, height] = CANVAS_DIMENSIONS[orientation];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const recalc = () => {
      const bounds = container.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;
      setScale(Math.min(bounds.width / width, bounds.height / height));
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(container);
    return () => ro.disconnect();
  }, [width, height]);

  const layerRefs = useRef<Record<AyatHadithLayerKey, HTMLDivElement | null>>({
    overlay: null,
    arabic: null,
    urdu: null,
    english: null,
    reference: null,
  });
  const setLayerRef = useCallback(
    (key: AyatHadithLayerKey) => (el: HTMLDivElement | null) => {
      layerRefs.current[key] = el;
    },
    []
  );

  useEffect(() => {
    if (snapshotMode) onSelectedChange(null);
  }, [snapshotMode, onSelectedChange]);

  const visibleLayers = useMemo(() => {
    return SELECTABLE_LAYERS.filter(key => {
      if (key === 'overlay') return style.show_overlay;
      if (key === 'arabic') return !!cachedText.arabic;
      if (key === 'urdu') return showUrdu && !!cachedText.urdu?.text;
      if (key === 'english') return showEnglish && !!cachedText.english?.text;
      if (key === 'reference') return showReference && !!cachedText.reference;
      return false;
    });
  }, [
    style.show_overlay,
    cachedText.arabic,
    cachedText.urdu?.text,
    cachedText.english?.text,
    cachedText.reference,
    showUrdu,
    showEnglish,
    showReference,
  ]);

  // Convert percentages to pixels for absolute positioning inside the canvas.
  const boxToPx = useCallback(
    (b: AyatHadithBox) => ({
      left: (b.x / 100) * width,
      top: (b.y / 100) * height,
      w: (b.width / 100) * width,
      h: (b.height / 100) * height,
    }),
    [width, height]
  );

  const commitLayer = (key: AyatHadithLayerKey, el: HTMLElement) => {
    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    const w = parseFloat(el.style.width) || 0;
    const h = parseFloat(el.style.height) || 0;
    const round = (v: number) => Math.round(v * 100) / 100;
    const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
    const xPct = round(clamp((left / width) * 100, 0, 100));
    const yPct = round(clamp((top / height) * 100, 0, 100));
    const wPct = round(clamp((w / width) * 100, 0, 100 - xPct));
    const hPct = round(clamp((h / height) * 100, 0, 100 - yPct));
    onPositionsChange({
      ...style.positions,
      [key]: { x: xPct, y: yPct, width: wPct, height: hPct },
    });
  };

  const backgroundStyle = backgroundCss(style.background);

  const arabicFont = resolveFont('arabic', style.arabic.font_id);
  const urduFont = resolveFont('urdu', style.urdu.font_id);
  const englishFont = resolveFont('english', style.english.font_id);
  const referenceEnglishFont = resolveFont('english', style.reference.font_id);
  const referenceArabicFont = resolveFont('arabic', style.reference.arabic_font_id);

  return (
    <div
      ref={containerRef}
      className='relative w-full h-full flex items-center justify-center overflow-hidden rounded-md'
    >
      <div
        ref={innerRef}
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          position: 'relative',
          flexShrink: 0,
          ...backgroundStyle,
        }}
        onMouseDown={e => {
          if (e.target === e.currentTarget) onSelectedChange(null);
        }}
      >
        {style.show_overlay && (
          <OverlayLayer
            ref={setLayerRef('overlay')}
            box={boxToPx(style.positions.overlay)}
            color={style.overlay_color}
            opacity={style.overlay_opacity}
            outlined={!snapshotMode && selected === 'overlay'}
            onSelect={() => onSelectedChange('overlay')}
          />
        )}
        {cachedText.arabic && (
          <TextLayer
            ref={setLayerRef('arabic')}
            box={boxToPx(style.positions.arabic)}
            text={cachedText.arabic}
            dir='rtl'
            fontFamily={arabicFont.family}
            size={style.arabic.size}
            color={style.arabic.color}
            lineHeight={style.arabic.line_height}
            align={style.arabic.align}
            fontWeight={700}
            outlined={!snapshotMode && selected === 'arabic'}
            onSelect={() => onSelectedChange('arabic')}
          />
        )}
        {showUrdu && cachedText.urdu?.text && (
          <TextLayer
            ref={setLayerRef('urdu')}
            box={boxToPx(style.positions.urdu)}
            text={cachedText.urdu.text}
            dir='rtl'
            fontFamily={urduFont.family}
            size={style.urdu.size}
            color={style.urdu.color}
            lineHeight={style.urdu.line_height}
            align={style.urdu.align}
            outlined={!snapshotMode && selected === 'urdu'}
            onSelect={() => onSelectedChange('urdu')}
          />
        )}
        {showEnglish && cachedText.english?.text && (
          <TextLayer
            ref={setLayerRef('english')}
            box={boxToPx(style.positions.english)}
            text={cachedText.english.text}
            dir='ltr'
            fontFamily={englishFont.family}
            size={style.english.size}
            color={style.english.color}
            lineHeight={style.english.line_height}
            align={style.english.align}
            outlined={!snapshotMode && selected === 'english'}
            onSelect={() => onSelectedChange('english')}
          />
        )}
        {showReference && cachedText.reference && (
          <ReferenceLayer
            ref={setLayerRef('reference')}
            box={boxToPx(style.positions.reference)}
            arabic={cachedText.reference.arabic}
            english={cachedText.reference.english}
            arabicFontFamily={referenceArabicFont.family}
            englishFontFamily={referenceEnglishFont.family}
            size={style.reference.size}
            color={style.reference.color}
            lineHeight={style.reference.line_height}
            align={style.reference.align}
            outlined={!snapshotMode && selected === 'reference'}
            onSelect={() => onSelectedChange('reference')}
          />
        )}
      </div>
      {!snapshotMode &&
        selected &&
        visibleLayers.includes(selected) &&
        layerRefs.current[selected] && (
          <Moveable
            target={layerRefs.current[selected]}
            draggable
            resizable
            throttleDrag={0}
            throttleResize={0}
            origin={false}
            snappable
            snapCenter
            snapThreshold={8}
            snapDirections={{
              top: true,
              left: true,
              bottom: true,
              right: true,
              center: true,
              middle: true,
            }}
            elementSnapDirections={{
              top: true,
              left: true,
              bottom: true,
              right: true,
              center: true,
              middle: true,
            }}
            verticalGuidelines={[0, width / 2, width]}
            horizontalGuidelines={[0, height / 2, height]}
            elementGuidelines={visibleLayers
              .filter(k => k !== selected)
              .map(k => layerRefs.current[k])
              .filter((el): el is HTMLDivElement => el !== null)}
            onDrag={({ target, left, top }) => {
              const el = target as HTMLElement;
              const w = el.offsetWidth;
              const h = el.offsetHeight;
              el.style.left = `${Math.max(0, Math.min(left, width - w))}px`;
              el.style.top = `${Math.max(0, Math.min(top, height - h))}px`;
            }}
            onDragEnd={({ target }) => commitLayer(selected, target as HTMLElement)}
            onResize={({ target, width: w, height: h, drag: { left, top } }) => {
              const el = target as HTMLElement;
              const right = Math.min(width, left + w);
              const bottom = Math.min(height, top + h);
              const newLeft = Math.max(0, left);
              const newTop = Math.max(0, top);
              const newW = Math.max(MIN_LAYER_SIZE_PX, right - newLeft);
              const newH = Math.max(MIN_LAYER_SIZE_PX, bottom - newTop);
              el.style.left = `${newLeft}px`;
              el.style.top = `${newTop}px`;
              el.style.width = `${newW}px`;
              el.style.height = `${newH}px`;
            }}
            onResizeEnd={({ target }) => commitLayer(selected, target as HTMLElement)}
          />
        )}
    </div>
  );
});
