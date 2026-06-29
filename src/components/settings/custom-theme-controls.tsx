import { useEffect, useId, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
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
  FONTS,
} from '@/constants';
import {
  SupabaseBuckets,
  SupabaseFolders,
  type AyatHadithBackground,
  type CustomThemeConfig,
  type CustomThemeTextGroup,
  type CustomThemeVisibility,
  type DisplayLanguage,
  type PostOrientation,
} from '@/types';
import { useBackgroundImages, useUserBackgrounds } from '@/hooks';
import { deleteUserBackground } from '@/lib/supabase';
import { BackgroundUploadTile, ImageTile } from '@/components/common';

type ImageSource = 'library' | 'upload';

interface CustomThemeControlsProps {
  config: CustomThemeConfig;
  onChange: (next: CustomThemeConfig) => void;
  /** Orientation used to validate uploaded images (16:9 vs 9:16). */
  orientation: PostOrientation;
  /** Language being previewed — only its font is shown in the Fonts section. */
  previewLanguage: DisplayLanguage;
}

// Which font (config key + FONTS category + label) applies per language.
const FONT_BY_LANGUAGE: Record<
  DisplayLanguage,
  { key: 'latin' | 'arabic' | 'urdu'; category: 'english' | 'arabic' | 'urdu'; label: string }
> = {
  en: { key: 'latin', category: 'english', label: 'Latin font' },
  ar: { key: 'arabic', category: 'arabic', label: 'Arabic font' },
  ur: { key: 'urdu', category: 'urdu', label: 'Urdu font' },
};

// The Overall scale is the primary size knob and reaches well above 1× so a
// whole screen can be enlarged; per-group sliders stay a tighter fine-tune on
// top of it (they compound), keeping the effective size from exploding.
const MAX_OVERALL_SCALE = 2.5;

const SIZE_GROUPS: { key: CustomThemeTextGroup; label: string }[] = [
  { key: 'names', label: 'Prayer names' },
  { key: 'times', label: 'Times & clock' },
  { key: 'countdown', label: 'Next Iqamah' },
  { key: 'header', label: 'Column headers' },
  { key: 'date', label: 'Date & sun times' },
];

// The three optional prayer-time columns. The prayer-name column is always
// shown, and at least one of these must stay visible.
const COLUMN_TOGGLES: { key: keyof CustomThemeVisibility; label: string }[] = [
  { key: 'columnStarts', label: 'Starts' },
  { key: 'columnAthan', label: 'Athan' },
  { key: 'columnIqamah', label: 'Iqamah' },
];

const FIELD_TOGGLES: { key: keyof CustomThemeVisibility; label: string }[] = [
  { key: 'clock', label: 'Clock' },
  { key: 'gregorianDate', label: 'Gregorian date' },
  { key: 'hijriDate', label: 'Hijri date' },
  { key: 'sunriseSunset', label: 'Sunrise & sunset' },
  { key: 'nextIqamahCard', label: 'Next Iqamah card' },
];

export function CustomThemeControls({
  config,
  onChange,
  orientation,
  previewLanguage,
}: CustomThemeControlsProps) {
  const { images, loading: imagesLoading, error: imagesError } = useBackgroundImages();
  const {
    images: userImages,
    loading: userImagesLoading,
    error: userImagesError,
    refetch: refetchUserImages,
  } = useUserBackgrounds();

  const [imageSource, setImageSource] = useState<ImageSource>('library');
  // Once uploads load, default the sub-tab to "Upload" if the saved background
  // is one of the masjid's own uploads. Runs only until the user picks a tab.
  const sourceResolved = useRef(false);

  const update = (patch: Partial<CustomThemeConfig>) => onChange({ ...config, ...patch });
  const setBackground = (background: AyatHadithBackground) => update({ background });
  const setOverlay = (patch: Partial<CustomThemeConfig['overlay']>) =>
    update({ overlay: { ...config.overlay, ...patch } });
  const setGroupSize = (group: CustomThemeTextGroup, value: number) =>
    update({ size: { ...config.size, groups: { ...config.size.groups, [group]: value } } });
  const setGlobalColor = (value: string) => update({ colors: { ...config.colors, global: value } });
  const setColorOverride = (group: CustomThemeTextGroup, value: string | null) =>
    update({
      colors: { ...config.colors, overrides: { ...config.colors.overrides, [group]: value } },
    });
  const setVisibility = (key: keyof CustomThemeVisibility, value: boolean) =>
    update({ visibility: { ...config.visibility, [key]: value } });

  const visibleColumnCount = COLUMN_TOGGLES.filter(c => config.visibility[c.key]).length;

  const bg = config.background;
  const colorValue = bg.type === 'color' ? bg.color : DEFAULT_CUSTOM_COLOR;
  const gradientFrom = bg.type === 'gradient' ? bg.from : DEFAULT_GRADIENT_FROM;
  const gradientTo = bg.type === 'gradient' ? bg.to : DEFAULT_GRADIENT_TO;
  const gradientAngle = bg.type === 'gradient' ? bg.angle : DEFAULT_GRADIENT_ANGLE;

  useEffect(() => {
    if (sourceResolved.current || userImagesLoading) return;
    sourceResolved.current = true;
    if (bg.type === 'image' && bg.url && userImages.some(img => img.url === bg.url)) {
      setImageSource('upload');
    }
  }, [userImagesLoading, userImages, bg]);

  const handleDeleteUpload = async (image: { name: string; url: string }) => {
    try {
      await deleteUserBackground(image.name);
      // If the deleted image was selected, fall back to the first library image.
      if (bg.type === 'image' && bg.url === image.url) {
        setBackground({ type: 'image', url: images[0]?.url || '' });
      }
      await refetchUserImages();
      toast.success('Image deleted');
    } catch (error) {
      console.error('Failed to delete background:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className='space-y-6'>
      {/* Background */}
      <section className='space-y-3'>
        <Label className='text-sm font-semibold'>Background</Label>
        <Tabs
          value={bg.type}
          onValueChange={v => {
            const t = v as AyatHadithBackground['type'];
            if (t === bg.type) return;
            if (t === 'image') {
              const firstUrl = (bg.type === 'image' && bg.url) || images[0]?.url || '';
              setBackground({ type: 'image', url: firstUrl });
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
          <div className='space-y-3'>
            <Tabs value={imageSource} onValueChange={v => setImageSource(v as ImageSource)}>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='library'>Library</TabsTrigger>
                <TabsTrigger value='upload'>Upload</TabsTrigger>
              </TabsList>
            </Tabs>

            {imageSource === 'library' &&
              (imagesLoading ? (
                <div className='grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='aspect-video rounded bg-muted animate-pulse' />
                  ))}
                </div>
              ) : imagesError ? (
                <p className='text-xs text-destructive'>{imagesError}</p>
              ) : images.length === 0 ? (
                <p className='text-xs text-muted-foreground'>
                  No images available. Upload images to the{' '}
                  <span className='font-mono'>{SupabaseFolders.AyatHadithBackgrounds}</span> folder
                  in the <span className='font-mono'>{SupabaseBuckets.Assets}</span> bucket.
                </p>
              ) : (
                <div className='grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1'>
                  {images.map(img => (
                    <ImageTile
                      key={img.url}
                      image={img}
                      selected={bg.type === 'image' && bg.url === img.url}
                      onSelect={() => setBackground({ type: 'image', url: img.url })}
                    />
                  ))}
                </div>
              ))}

            {imageSource === 'upload' && (
              <div className='space-y-2'>
                {userImagesError && <p className='text-xs text-destructive'>{userImagesError}</p>}
                <div className='grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1'>
                  <BackgroundUploadTile
                    orientation={orientation}
                    onUploaded={async url => {
                      await refetchUserImages();
                      setBackground({ type: 'image', url });
                    }}
                  />
                  {userImagesLoading
                    ? Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className='aspect-video rounded bg-muted animate-pulse' />
                      ))
                    : userImages.map(img => (
                        <ImageTile
                          key={img.url}
                          image={img}
                          selected={bg.type === 'image' && bg.url === img.url}
                          onSelect={() => setBackground({ type: 'image', url: img.url })}
                          onDelete={() => handleDeleteUpload(img)}
                        />
                      ))}
                </div>
                <p className='text-[10px] text-muted-foreground'>
                  Images are validated for {orientation === 'portrait' ? '9:16' : '16:9'} and must
                  be under 5MB.
                </p>
              </div>
            )}
          </div>
        )}

        {bg.type === 'color' && (
          <ColorInput
            value={colorValue}
            onChange={v => setBackground({ type: 'color', color: v })}
            className='h-9 w-full p-1'
          />
        )}

        {bg.type === 'gradient' && (
          <div className='space-y-2'>
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
            <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
              Angle: {gradientAngle}°
            </Label>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[gradientAngle]}
              onValueChange={v =>
                setBackground({ type: 'gradient', from: gradientFrom, to: gradientTo, angle: v[0] })
              }
            />
          </div>
        )}
      </section>

      {/* Overlay */}
      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-semibold'>Overlay</Label>
          <div className='flex items-center gap-2'>
            <Label
              htmlFor='custom-overlay'
              className='text-xs text-muted-foreground cursor-pointer'
            >
              Show
            </Label>
            <Switch
              id='custom-overlay'
              checked={config.overlay.enabled}
              onCheckedChange={v => setOverlay({ enabled: v })}
            />
          </div>
        </div>
        {config.overlay.enabled && (
          <>
            <ColorInput
              value={config.overlay.color}
              onChange={v => setOverlay({ color: v })}
              className='h-9 w-full p-1'
            />
            <Label className='text-xs text-muted-foreground'>
              Opacity: {Math.round(config.overlay.opacity * 100)}%
            </Label>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[config.overlay.opacity * 100]}
              onValueChange={v => setOverlay({ opacity: v[0] / 100 })}
            />
          </>
        )}
      </section>

      {/* Fonts — only the previewed language's font is shown */}
      {(() => {
        const f = FONT_BY_LANGUAGE[previewLanguage];
        return (
          <section className='space-y-3'>
            <Label className='text-sm font-semibold'>Fonts</Label>
            <FontSelect
              label={f.label}
              category={f.category}
              value={config.fonts[f.key]}
              onChange={v => update({ fonts: { ...config.fonts, [f.key]: v } })}
            />
          </section>
        );
      })()}

      {/* Sizes */}
      <section className='space-y-3'>
        <Label className='text-sm font-semibold'>Text size</Label>
        <MultiplierSlider
          label='Overall scale'
          value={config.size.scale}
          max={MAX_OVERALL_SCALE}
          onChange={v => update({ size: { ...config.size, scale: v } })}
        />
        <div className='space-y-3 pl-1'>
          {SIZE_GROUPS.map(g => (
            <MultiplierSlider
              key={g.key}
              label={g.label}
              value={config.size.groups[g.key]}
              onChange={v => setGroupSize(g.key, v)}
            />
          ))}
        </div>
      </section>

      {/* Colors */}
      <section className='space-y-3'>
        <Label className='text-sm font-semibold'>Text colors</Label>

        <div className='space-y-1'>
          <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
            Global
          </Label>
          <ColorInput
            value={config.colors.global}
            onChange={setGlobalColor}
            className='h-9 w-full p-1'
          />
        </div>

        <div className='space-y-3 pt-1'>
          <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
            Per-group overrides
          </Label>
          {SIZE_GROUPS.map(g => {
            const override = config.colors.overrides[g.key];
            const isCustom = override !== null;
            return (
              <div key={g.key} className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <Label className='text-xs text-muted-foreground'>{g.label}</Label>
                  <div className='flex items-center gap-2'>
                    <span className='text-[10px] text-muted-foreground'>Custom</span>
                    <Switch
                      aria-label={`Custom ${g.label} color`}
                      checked={isCustom}
                      onCheckedChange={on =>
                        setColorOverride(g.key, on ? config.colors.global : null)
                      }
                    />
                  </div>
                </div>
                {isCustom && (
                  <ColorInput
                    value={override}
                    onChange={v => setColorOverride(g.key, v)}
                    className='h-9 w-full p-1'
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Visible elements */}
      <section className='space-y-3'>
        <Label className='text-sm font-semibold'>Visible elements</Label>

        <div className='space-y-2'>
          <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
            Prayer time columns
          </Label>
          {COLUMN_TOGGLES.map(c => {
            const checked = config.visibility[c.key];
            // Don't let the user hide the last remaining time column.
            const lockOn = checked && visibleColumnCount === 1;
            return (
              <ToggleRow
                key={c.key}
                label={c.label}
                checked={checked}
                disabled={lockOn}
                onChange={v => setVisibility(c.key, v)}
              />
            );
          })}
          <p className='text-[10px] text-muted-foreground'>
            At least one prayer time column must stay visible.
          </p>
        </div>

        <div className='space-y-2 pt-1'>
          <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
            Other fields
          </Label>
          {FIELD_TOGGLES.map(f => (
            <ToggleRow
              key={f.key}
              label={f.label}
              checked={config.visibility[f.key]}
              onChange={v => setVisibility(f.key, v)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ label, checked, onChange, disabled }: ToggleRowProps) {
  const id = useId();
  return (
    <div className='flex items-center justify-between'>
      <Label htmlFor={id} className='text-xs text-muted-foreground cursor-pointer'>
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

interface FontSelectProps {
  label: string;
  category: 'english' | 'arabic' | 'urdu';
  value: string;
  onChange: (id: string) => void;
}

function FontSelect({ label, category, value, onChange }: FontSelectProps) {
  return (
    <div className='space-y-1'>
      <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>{label}</Label>
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

interface MultiplierSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Upper bound of the slider. Defaults to the per-group fine-tune range. */
  max?: number;
}

function MultiplierSlider({ label, value, onChange, max = 1.5 }: MultiplierSliderProps) {
  return (
    <div className='space-y-2'>
      <Label className='text-xs text-muted-foreground'>
        {label}: {value.toFixed(2)}×
      </Label>
      <Slider min={0.5} max={max} step={0.05} value={[value]} onValueChange={v => onChange(v[0])} />
    </div>
  );
}
