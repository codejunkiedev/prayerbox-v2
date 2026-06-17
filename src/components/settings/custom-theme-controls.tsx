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
} from '@/types';
import { useBackgroundImages } from '@/hooks';
import { ImageTile } from '@/components/ayat-hadith-designer/image-tile';

interface CustomThemeControlsProps {
  config: CustomThemeConfig;
  onChange: (next: CustomThemeConfig) => void;
}

const SIZE_GROUPS: { key: CustomThemeTextGroup; label: string }[] = [
  { key: 'names', label: 'Prayer names' },
  { key: 'times', label: 'Times & clock' },
  { key: 'countdown', label: 'Next Iqamah' },
  { key: 'header', label: 'Column headers' },
  { key: 'date', label: 'Date & sun times' },
];

export function CustomThemeControls({ config, onChange }: CustomThemeControlsProps) {
  const { images, loading: imagesLoading, error: imagesError } = useBackgroundImages();

  const update = (patch: Partial<CustomThemeConfig>) => onChange({ ...config, ...patch });
  const setBackground = (background: AyatHadithBackground) => update({ background });
  const setOverlay = (patch: Partial<CustomThemeConfig['overlay']>) =>
    update({ overlay: { ...config.overlay, ...patch } });
  const setGroupSize = (group: CustomThemeTextGroup, value: number) =>
    update({ size: { ...config.size, groups: { ...config.size.groups, [group]: value } } });
  const setColor = (group: CustomThemeTextGroup, value: string) =>
    update({ colors: { ...config.colors, [group]: value } });

  const bg = config.background;
  const colorValue = bg.type === 'color' ? bg.color : DEFAULT_CUSTOM_COLOR;
  const gradientFrom = bg.type === 'gradient' ? bg.from : DEFAULT_GRADIENT_FROM;
  const gradientTo = bg.type === 'gradient' ? bg.to : DEFAULT_GRADIENT_TO;
  const gradientAngle = bg.type === 'gradient' ? bg.angle : DEFAULT_GRADIENT_ANGLE;

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

        {bg.type === 'image' &&
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
              <span className='font-mono'>{SupabaseFolders.AyatHadithBackgrounds}</span> folder in
              the <span className='font-mono'>{SupabaseBuckets.Assets}</span> bucket.
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

      {/* Fonts */}
      <section className='space-y-3'>
        <Label className='text-sm font-semibold'>Fonts</Label>
        <div className='grid grid-cols-2 gap-3'>
          <FontSelect
            label='Latin font'
            category='english'
            value={config.fonts.latin}
            onChange={v => update({ fonts: { ...config.fonts, latin: v } })}
          />
          <FontSelect
            label='Arabic font'
            category='arabic'
            value={config.fonts.arabic}
            onChange={v => update({ fonts: { ...config.fonts, arabic: v } })}
          />
        </div>
      </section>

      {/* Sizes */}
      <section className='space-y-3'>
        <Label className='text-sm font-semibold'>Text size</Label>
        <MultiplierSlider
          label='Overall scale'
          value={config.size.scale}
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
        <div className='grid grid-cols-2 gap-3'>
          {SIZE_GROUPS.map(g => (
            <div key={g.key} className='space-y-1'>
              <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
                {g.label}
              </Label>
              <ColorInput
                value={config.colors[g.key]}
                onChange={v => setColor(g.key, v)}
                className='h-9 w-full p-1'
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface FontSelectProps {
  label: string;
  category: 'english' | 'arabic';
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
}

function MultiplierSlider({ label, value, onChange }: MultiplierSliderProps) {
  return (
    <div className='space-y-2'>
      <Label className='text-xs text-muted-foreground'>
        {label}: {value.toFixed(2)}×
      </Label>
      <Slider min={0.5} max={1.5} step={0.05} value={[value]} onValueChange={v => onChange(v[0])} />
    </div>
  );
}
