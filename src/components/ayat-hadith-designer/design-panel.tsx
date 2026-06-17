import { AlignCenter, AlignLeft, AlignRight, RotateCcw } from 'lucide-react';
import {
  Button,
  ColorInput,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import {
  DEFAULT_CUSTOM_COLOR,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_FROM,
  DEFAULT_GRADIENT_TO,
  DEFAULT_POSITIONS,
  FONTS,
} from '@/constants';
import {
  SupabaseBuckets,
  SupabaseFolders,
  type AyatHadithAlign,
  type AyatHadithBackground,
  type AyatHadithLayerKey,
  type AyatHadithReferenceStyle,
  type AyatHadithStyle,
} from '@/types';
import { cn } from '@/utils';
import { gradientCss } from '@/helpers';
import { ImageTile } from '@/components/common';
import { useBackgroundImages } from '@/hooks';

type DesignTab = 'canvas' | 'arabic' | 'urdu' | 'english' | 'reference';

function tabToLayer(tab: DesignTab): AyatHadithLayerKey | null {
  return tab === 'canvas' ? null : tab;
}

interface DesignPanelProps {
  style: AyatHadithStyle;
  onChange: (next: AyatHadithStyle) => void;
  showUrdu: boolean;
  showEnglish: boolean;
  showReference: boolean;
  selected: AyatHadithLayerKey | null;
  onSelectedChange: (next: AyatHadithLayerKey | null) => void;
}

function layerToTab(selected: AyatHadithLayerKey | null): DesignTab {
  if (!selected) return 'canvas';
  if (selected === 'overlay') return 'canvas';
  return selected;
}

export function DesignPanel({
  style,
  onChange,
  showUrdu,
  showEnglish,
  showReference,
  selected,
  onSelectedChange,
}: DesignPanelProps) {
  const update = (patch: Partial<AyatHadithStyle>) => onChange({ ...style, ...patch });
  const setBackground = (background: AyatHadithBackground) => update({ background });

  const bg = style.background;
  const colorValue = bg.type === 'color' ? bg.color : DEFAULT_CUSTOM_COLOR;
  const gradientFrom = bg.type === 'gradient' ? bg.from : DEFAULT_GRADIENT_FROM;
  const gradientTo = bg.type === 'gradient' ? bg.to : DEFAULT_GRADIENT_TO;
  const gradientAngle = bg.type === 'gradient' ? bg.angle : DEFAULT_GRADIENT_ANGLE;

  const { images, loading: imagesLoading, error: imagesError } = useBackgroundImages();

  const activeTab = layerToTab(selected);
  const tabs: { key: DesignTab; label: string }[] = [
    { key: 'canvas', label: 'Canvas' },
    { key: 'arabic', label: 'Arabic' },
    ...(showUrdu ? [{ key: 'urdu' as const, label: 'Urdu' }] : []),
    ...(showEnglish ? [{ key: 'english' as const, label: 'English' }] : []),
    ...(showReference ? [{ key: 'reference' as const, label: 'Reference' }] : []),
  ];

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Label className='text-xs text-muted-foreground shrink-0'>Editing</Label>
        <Select value={activeTab} onValueChange={v => onSelectedChange(tabToLayer(v as DesignTab))}>
          <SelectTrigger size='sm' className='flex-1'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tabs.map(t => (
              <SelectItem key={t.key} value={t.key}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type='button'
          variant='outline'
          size='sm'
          onClick={() => {
            update({ positions: DEFAULT_POSITIONS });
            onSelectedChange(null);
          }}
        >
          <RotateCcw className='h-3.5 w-3.5 mr-1.5' />
          Reset
        </Button>
      </div>

      {activeTab === 'canvas' && (
        <>
          <section className='space-y-4'>
            <Label className='text-sm font-semibold'>Background</Label>

            <Tabs
              value={bg.type}
              onValueChange={v => {
                const t = v as AyatHadithBackground['type'];
                if (t === bg.type) return;
                if (t === 'image') {
                  const firstUrl = (bg.type === 'image' && bg.url) || images[0]?.url;
                  setBackground(
                    firstUrl ? { type: 'image', url: firstUrl } : { type: 'image', url: '' }
                  );
                } else if (t === 'color') {
                  setBackground({ type: 'color', color: colorValue });
                } else {
                  setBackground({
                    type: 'gradient',
                    from: gradientFrom,
                    to: gradientTo,
                    angle: gradientAngle,
                  });
                }
              }}
            >
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='image'>Image</TabsTrigger>
                <TabsTrigger value='color'>Color</TabsTrigger>
                <TabsTrigger value='gradient'>Gradient</TabsTrigger>
              </TabsList>
            </Tabs>

            {bg.type === 'image' && (
              <div className='space-y-1.5'>
                {imagesLoading ? (
                  <div className='grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1'>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className='aspect-video rounded bg-muted animate-pulse' />
                    ))}
                  </div>
                ) : imagesError ? (
                  <p className='text-xs text-destructive'>{imagesError}</p>
                ) : images.length === 0 ? (
                  <p className='text-xs text-muted-foreground'>
                    No images available. Upload images to the{' '}
                    <span className='font-mono'>{SupabaseFolders.AyatHadithBackgrounds}</span>{' '}
                    folder in the <span className='font-mono'>{SupabaseBuckets.Assets}</span>{' '}
                    bucket.
                  </p>
                ) : (
                  <div className='grid grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1'>
                    {images.map(img => (
                      <ImageTile
                        key={img.url}
                        image={img}
                        selected={bg.url === img.url}
                        onSelect={() => setBackground({ type: 'image', url: img.url })}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {bg.type === 'color' && (
              <div className='space-y-2'>
                <div
                  className='w-full aspect-[3/1] rounded border'
                  style={{ backgroundColor: colorValue }}
                />
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
            )}

            {bg.type === 'gradient' && (
              <div className='space-y-2'>
                <div
                  className='w-full aspect-[3/1] rounded border'
                  style={{
                    backgroundImage: gradientCss(gradientFrom, gradientTo, gradientAngle),
                  }}
                />
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
            )}
          </section>

          <section className='space-y-3 pt-2'>
            <div className='flex items-center justify-between'>
              <Label className='text-sm font-semibold'>Overlay</Label>
              <div className='flex items-center gap-2'>
                <Label
                  htmlFor='show-overlay'
                  className='text-xs text-muted-foreground cursor-pointer'
                >
                  Show
                </Label>
                <Switch
                  id='show-overlay'
                  checked={style.show_overlay}
                  onCheckedChange={v => update({ show_overlay: v })}
                />
              </div>
            </div>
            {style.show_overlay && (
              <>
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
              </>
            )}
          </section>
        </>
      )}

      {activeTab === 'arabic' && (
        <TextStyleControls
          label='Arabic text'
          category='arabic'
          style={style.arabic}
          onChange={next => update({ arabic: next })}
        />
      )}

      {activeTab === 'urdu' && showUrdu && (
        <TextStyleControls
          label='Urdu translation'
          category='urdu'
          style={style.urdu}
          onChange={next => update({ urdu: next })}
        />
      )}

      {activeTab === 'english' && showEnglish && (
        <TextStyleControls
          label='English translation'
          category='english'
          style={style.english}
          onChange={next => update({ english: next })}
        />
      )}

      {activeTab === 'reference' && showReference && (
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
      <Slider min={16} max={100} step={2} value={[size]} onValueChange={v => onChange(v[0])} />
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

interface AlignmentToggleProps {
  value: AyatHadithAlign;
  onChange: (next: AyatHadithAlign) => void;
}

function AlignmentToggle({ value, onChange }: AlignmentToggleProps) {
  const options: { value: AyatHadithAlign; icon: typeof AlignLeft; label: string }[] = [
    { value: 'left', icon: AlignLeft, label: 'Left' },
    { value: 'center', icon: AlignCenter, label: 'Center' },
    { value: 'right', icon: AlignRight, label: 'Right' },
  ];
  return (
    <div className='space-y-2'>
      <Label className='text-xs text-muted-foreground'>Alignment</Label>
      <div className='grid grid-cols-3 gap-1'>
        {options.map(opt => {
          const Icon = opt.icon;
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type='button'
              onClick={() => onChange(opt.value)}
              aria-label={opt.label}
              className={cn(
                'inline-flex items-center justify-center h-9 rounded-md border text-sm transition cursor-pointer',
                active
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className='h-4 w-4' />
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ReferenceStyleControlsProps {
  style: AyatHadithReferenceStyle;
  onChange: (next: AyatHadithReferenceStyle) => void;
}

function ReferenceStyleControls({ style, onChange }: ReferenceStyleControlsProps) {
  return (
    <section className='space-y-3'>
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
      <AlignmentToggle value={style.align} onChange={v => onChange({ ...style, align: v })} />
    </section>
  );
}

interface TextStyle {
  font_id: string;
  size: number;
  color: string;
  line_height: number;
  align: AyatHadithAlign;
}

interface TextStyleControlsProps {
  label: string;
  category: 'arabic' | 'urdu' | 'english';
  style: TextStyle;
  onChange: (next: TextStyle) => void;
}

function TextStyleControls({ label, category, style, onChange }: TextStyleControlsProps) {
  return (
    <section className='space-y-3'>
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
      <AlignmentToggle value={style.align} onChange={v => onChange({ ...style, align: v })} />
    </section>
  );
}
