import { CheckCircle } from 'lucide-react';
import {
  ColorInput,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from '@/components/ui';
import {
  DEFAULT_CUSTOM_COLOR,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_FROM,
  DEFAULT_GRADIENT_TO,
  FONTS,
} from '@/constants';
import {
  SupabaseBuckets,
  SupabaseFolders,
  type AyatHadithBackground,
  type AyatHadithReferenceStyle,
  type AyatHadithStyle,
} from '@/types';
import { cn } from '@/utils';
import { gradientCss } from './helpers';
import { ImageTile } from './image-tile';
import { useBackgroundImages } from './use-background-images';

const ACTIVE_RING = 'border-primary ring-2 ring-primary/40';
const INACTIVE_RING = 'border-transparent hover:border-muted-foreground/50';

function SelectedBadge() {
  return (
    <div className='absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow'>
      <CheckCircle className='h-3.5 w-3.5' />
    </div>
  );
}

interface DesignPanelProps {
  style: AyatHadithStyle;
  onChange: (next: AyatHadithStyle) => void;
  showUrdu: boolean;
  showEnglish: boolean;
  showReference: boolean;
}

export function DesignPanel({
  style,
  onChange,
  showUrdu,
  showEnglish,
  showReference,
}: DesignPanelProps) {
  const update = (patch: Partial<AyatHadithStyle>) => onChange({ ...style, ...patch });
  const setBackground = (background: AyatHadithBackground) => update({ background });

  const bg = style.background;
  const colorValue = bg.type === 'color' ? bg.color : DEFAULT_CUSTOM_COLOR;
  const gradientFrom = bg.type === 'gradient' ? bg.from : DEFAULT_GRADIENT_FROM;
  const gradientTo = bg.type === 'gradient' ? bg.to : DEFAULT_GRADIENT_TO;
  const gradientAngle = bg.type === 'gradient' ? bg.angle : DEFAULT_GRADIENT_ANGLE;

  const { images, loading: imagesLoading, error: imagesError } = useBackgroundImages();

  return (
    <div className='space-y-6'>
      <section className='space-y-4'>
        <Label className='text-sm font-semibold'>Background</Label>

        <div className='space-y-1.5'>
          <Label className='text-xs text-muted-foreground'>Images</Label>
          {imagesLoading ? (
            <div className='grid grid-cols-3 gap-2'>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='aspect-video rounded bg-muted animate-pulse' />
              ))}
            </div>
          ) : imagesError ? (
            <p className='text-xs text-destructive'>{imagesError}</p>
          ) : images.length === 0 ? (
            <p className='text-xs text-muted-foreground'>
              No images available. Upload images to the{' '}
              <span className='font-mono'>{SupabaseFolders.AyatHadithBackgrounds}</span> folder in
              the <span className='font-mono'>{SupabaseBuckets.Assets}</span> bucket.
            </p>
          ) : (
            <div className='grid grid-cols-3 gap-2'>
              {images.map(img => (
                <ImageTile
                  key={img.url}
                  image={img}
                  selected={bg.type === 'image' && bg.url === img.url}
                  onSelect={() => setBackground({ type: 'image', url: img.url })}
                />
              ))}
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground'>Solid color</Label>
          <button
            type='button'
            onClick={() => setBackground({ type: 'color', color: colorValue })}
            className={cn(
              'relative w-full aspect-[3/1] rounded border-2 transition cursor-pointer',
              bg.type === 'color' ? ACTIVE_RING : INACTIVE_RING
            )}
            style={{ backgroundColor: colorValue }}
            title='Use solid color'
          >
            {bg.type === 'color' && <SelectedBadge />}
          </button>
          <div className='space-y-1'>
            <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
              Color
            </Label>
            <ColorInput
              value={colorValue}
              onChange={v => setBackground({ type: 'color', color: v })}
              className='h-9 w-full p-1'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground'>Gradient</Label>
          <button
            type='button'
            onClick={() =>
              setBackground({
                type: 'gradient',
                from: gradientFrom,
                to: gradientTo,
                angle: gradientAngle,
              })
            }
            className={cn(
              'relative w-full aspect-[3/1] rounded border-2 transition cursor-pointer',
              bg.type === 'gradient' ? ACTIVE_RING : INACTIVE_RING
            )}
            style={{ backgroundImage: gradientCss(gradientFrom, gradientTo, gradientAngle) }}
            title='Use gradient'
          >
            {bg.type === 'gradient' && <SelectedBadge />}
          </button>
          <div className='flex items-center gap-3'>
            <div className='space-y-1 flex-1'>
              <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
                From
              </Label>
              <ColorInput
                value={gradientFrom}
                onChange={v =>
                  setBackground({
                    type: 'gradient',
                    from: v,
                    to: gradientTo,
                    angle: gradientAngle,
                  })
                }
                className='h-9 w-full p-1'
              />
            </div>
            <div className='space-y-1 flex-1'>
              <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
                To
              </Label>
              <ColorInput
                value={gradientTo}
                onChange={v =>
                  setBackground({
                    type: 'gradient',
                    from: gradientFrom,
                    to: v,
                    angle: gradientAngle,
                  })
                }
                className='h-9 w-full p-1'
              />
            </div>
          </div>
          <div className='space-y-1'>
            <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
              Angle: {gradientAngle}°
            </Label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[gradientAngle]}
              onValueChange={v =>
                setBackground({
                  type: 'gradient',
                  from: gradientFrom,
                  to: gradientTo,
                  angle: v[0],
                })
              }
            />
          </div>
        </div>
      </section>

      <section className='space-y-2'>
        <Label className='text-sm font-semibold'>Overlay</Label>
        <ColorPickerField
          value={style.overlay_color}
          onChange={v => update({ overlay_color: v })}
        />
        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground'>
            Opacity: {Math.round(style.overlay_opacity * 100)}%
          </Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={[style.overlay_opacity * 100]}
            onValueChange={v => update({ overlay_opacity: v[0] / 100 })}
          />
        </div>
      </section>

      <TextStyleControls
        label='Arabic text'
        category='arabic'
        style={style.arabic}
        onChange={next => update({ arabic: next })}
      />

      {showUrdu && (
        <TextStyleControls
          label='Urdu translation'
          category='urdu'
          style={style.urdu}
          onChange={next => update({ urdu: next })}
        />
      )}

      {showEnglish && (
        <TextStyleControls
          label='English translation'
          category='english'
          style={style.english}
          onChange={next => update({ english: next })}
        />
      )}

      {showReference && (
        <ReferenceStyleControls
          style={style.reference}
          onChange={next => update({ reference: next })}
        />
      )}
    </div>
  );
}

interface FontSelectProps {
  label: string;
  category: 'arabic' | 'urdu' | 'english';
  value: string;
  onChange: (id: string) => void;
}

function FontSelect({ label, category, value, onChange }: FontSelectProps) {
  return (
    <div className='space-y-2'>
      <Label className='text-xs text-muted-foreground'>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FONTS[category].map(f => (
            <SelectItem key={f.id} value={f.id}>
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface SizeSliderProps {
  size: number;
  onChange: (size: number) => void;
}

function SizeSlider({ size, onChange }: SizeSliderProps) {
  return (
    <div className='space-y-2'>
      <Label className='text-xs text-muted-foreground'>Size: {size}px</Label>
      <Slider min={16} max={200} step={2} value={[size]} onValueChange={v => onChange(v[0])} />
    </div>
  );
}

interface ColorPickerFieldProps {
  value: string;
  onChange: (color: string) => void;
}

function ColorPickerField({ value, onChange }: ColorPickerFieldProps) {
  return (
    <div className='space-y-1'>
      <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>Color</Label>
      <ColorInput value={value} onChange={onChange} className='h-9 w-full p-1' />
    </div>
  );
}

interface LineHeightSliderProps {
  value: number;
  onChange: (value: number) => void;
}

function LineHeightSlider({ value, onChange }: LineHeightSliderProps) {
  return (
    <div className='space-y-2'>
      <Label className='text-xs text-muted-foreground'>Line spacing: {value.toFixed(1)}</Label>
      <Slider min={1} max={3} step={0.1} value={[value]} onValueChange={v => onChange(v[0])} />
    </div>
  );
}

interface ReferenceStyleControlsProps {
  style: AyatHadithReferenceStyle;
  onChange: (next: AyatHadithReferenceStyle) => void;
}

function ReferenceStyleControls({ style, onChange }: ReferenceStyleControlsProps) {
  return (
    <section className='space-y-3 border-t pt-4'>
      <Label className='text-sm font-semibold'>Reference</Label>
      <div className='grid grid-cols-2 gap-3'>
        <FontSelect
          label='Arabic font'
          category='arabic'
          value={style.arabic_font_id}
          onChange={v => onChange({ ...style, arabic_font_id: v })}
        />
        <FontSelect
          label='English font'
          category='english'
          value={style.font_id}
          onChange={v => onChange({ ...style, font_id: v })}
        />
      </div>
      <SizeSlider size={style.size} onChange={v => onChange({ ...style, size: v })} />
      <ColorPickerField value={style.color} onChange={v => onChange({ ...style, color: v })} />
      <LineHeightSlider
        value={style.line_height}
        onChange={v => onChange({ ...style, line_height: v })}
      />
    </section>
  );
}

interface TextStyle {
  font_id: string;
  size: number;
  color: string;
  line_height: number;
}

interface TextStyleControlsProps {
  label: string;
  category: 'arabic' | 'urdu' | 'english';
  style: TextStyle;
  onChange: (next: TextStyle) => void;
}

function TextStyleControls({ label, category, style, onChange }: TextStyleControlsProps) {
  return (
    <section className='space-y-3 border-t pt-4'>
      <Label className='text-sm font-semibold'>{label}</Label>
      <FontSelect
        label='Font'
        category={category}
        value={style.font_id}
        onChange={v => onChange({ ...style, font_id: v })}
      />
      <SizeSlider size={style.size} onChange={v => onChange({ ...style, size: v })} />
      <ColorPickerField value={style.color} onChange={v => onChange({ ...style, color: v })} />
      <LineHeightSlider
        value={style.line_height}
        onChange={v => onChange({ ...style, line_height: v })}
      />
    </section>
  );
}
