import { useId } from 'react';
import {
  ColorInput,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Textarea,
} from '@/components/ui';
import { BANNER_MAX_LENGTH, FONTS } from '@/constants';
import {
  type CustomThemeBanner,
  type CustomThemeConfig,
  type CustomThemeTextGroup,
  type CustomThemeVisibility,
  type DisplayLanguage,
  type PostOrientation,
} from '@/types';
import { BackgroundControl } from '@/components/common';

interface CustomThemeControlsProps {
  config: CustomThemeConfig;
  onChange: (next: CustomThemeConfig) => void;
  /** Orientation used to validate uploaded images (16:9 vs 9:16). */
  orientation: PostOrientation;
  /** Language being previewed — only its font is shown in the Fonts section. */
  previewLanguage: DisplayLanguage;
}

// Each language maps to one font category, which is also its key in config.fonts.
const FONT_CATEGORY_BY_LANGUAGE: Record<DisplayLanguage, 'english' | 'arabic' | 'urdu'> = {
  en: 'english',
  ar: 'arabic',
  ur: 'urdu',
};

// Both the Overall scale and the per-group sliders reach well above 1× so a
// whole screen — or a single group — can be enlarged substantially. Per-group
// sliders compound on top of the overall scale.
const MAX_SCALE = 3;

const SIZE_GROUPS: { key: CustomThemeTextGroup; label: string }[] = [
  { key: 'names', label: 'Prayer names' },
  { key: 'times', label: 'Times & clock' },
  { key: 'countdown', label: 'Next Iqamah' },
  { key: 'header', label: 'Column headers' },
  { key: 'date', label: 'Date & sun times' },
  { key: 'masjidName', label: 'Masjid name' },
  { key: 'banner', label: 'Banner' },
];

const POSITION_OPTIONS: { value: CustomThemeBanner['position']; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
];

const DIRECTION_OPTIONS: { value: CustomThemeBanner['direction']; label: string }[] = [
  { value: 'ltr', label: 'Left to right' },
  { value: 'rtl', label: 'Right to left' },
];

const SPEED_OPTIONS: { value: CustomThemeBanner['speed']; label: string }[] = [
  { value: 'slow', label: 'Slow' },
  { value: 'normal', label: 'Normal' },
  { value: 'fast', label: 'Fast' },
];

const FONT_GROUPS: { category: 'english' | 'arabic' | 'urdu'; label: string }[] = [
  { category: 'english', label: 'English' },
  { category: 'arabic', label: 'Arabic' },
  { category: 'urdu', label: 'Urdu' },
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
  { key: 'masjidName', label: 'Masjid name' },
  { key: 'sunriseSunset', label: 'Sunrise & sunset' },
  { key: 'nextIqamahCard', label: 'Next Iqamah card' },
];

export function CustomThemeControls({
  config,
  onChange,
  orientation,
  previewLanguage,
}: CustomThemeControlsProps) {
  const update = (patch: Partial<CustomThemeConfig>) => onChange({ ...config, ...patch });
  const setGroupSize = (group: CustomThemeTextGroup, value: number) =>
    update({ size: { ...config.size, groups: { ...config.size.groups, [group]: value } } });
  const setGlobalColor = (value: string) => update({ colors: { ...config.colors, global: value } });
  const setColorOverride = (group: CustomThemeTextGroup, value: string | null) =>
    update({
      colors: { ...config.colors, overrides: { ...config.colors.overrides, [group]: value } },
    });
  const setVisibility = (key: keyof CustomThemeVisibility, value: boolean) =>
    update({ visibility: { ...config.visibility, [key]: value } });
  const setBanner = (patch: Partial<CustomThemeBanner>) =>
    update({ banner: { ...config.banner, ...patch } });
  const setBannerBackground = (patch: Partial<CustomThemeBanner['background']>) =>
    setBanner({ background: { ...config.banner.background, ...patch } });

  const visibleColumnCount = COLUMN_TOGGLES.filter(c => config.visibility[c.key]).length;
  const bannerId = useId();

  const hiddenGroups = new Set<CustomThemeTextGroup>();
  if (!config.banner.enabled) hiddenGroups.add('banner');
  if (!config.visibility.masjidName) hiddenGroups.add('masjidName');
  const textGroups = SIZE_GROUPS.filter(g => !hiddenGroups.has(g.key));

  return (
    <div className='space-y-6'>
      <BackgroundControl
        background={config.background}
        onBackgroundChange={background => update({ background })}
        overlay={config.overlay}
        onOverlayChange={overlay => update({ overlay })}
        uploadOrientation={orientation}
      />

      {/* Fonts — only the previewed language's font is shown */}
      {(() => {
        const category = FONT_CATEGORY_BY_LANGUAGE[previewLanguage];
        return (
          <section className='space-y-3'>
            <Label className='text-sm font-semibold'>Font</Label>
            <FontSelect
              category={category}
              value={config.fonts[category]}
              onChange={v => update({ fonts: { ...config.fonts, [category]: v } })}
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
          max={MAX_SCALE}
          onChange={v => update({ size: { ...config.size, scale: v } })}
        />
        <div className='space-y-3 pl-1'>
          {textGroups.map(g => (
            <MultiplierSlider
              key={g.key}
              label={g.label}
              value={config.size.groups[g.key]}
              max={MAX_SCALE}
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
          {textGroups.map(g => {
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
          <p className='text-[10px] text-muted-foreground'>
            The masjid name comes from your profile. Urdu and Arabic screens use the translated name
            when you have set one, and the English name otherwise.
          </p>
        </div>
      </section>

      {/* Banner — a scrolling announcement ticker */}
      <section className='space-y-3'>
        <div className='flex items-center justify-between'>
          <Label className='text-sm font-semibold'>Banner</Label>
          <div className='flex items-center gap-2'>
            <Label htmlFor={bannerId} className='text-xs text-muted-foreground cursor-pointer'>
              Show
            </Label>
            <Switch
              id={bannerId}
              checked={config.banner.enabled}
              onCheckedChange={enabled => setBanner({ enabled })}
            />
          </div>
        </div>
        {config.banner.enabled && (
          <>
            <div className='space-y-1'>
              <Textarea
                value={config.banner.text}
                onChange={e => setBanner({ text: e.target.value.slice(0, BANNER_MAX_LENGTH) })}
                maxLength={BANNER_MAX_LENGTH}
                rows={3}
                placeholder='Announcement to scroll across the screen'
                className='resize-none'
              />
              <p className='text-[10px] text-muted-foreground text-right'>
                {config.banner.text.length}/{BANNER_MAX_LENGTH}
              </p>
            </div>

            <OptionSelect
              label='Position'
              value={config.banner.position}
              options={POSITION_OPTIONS}
              onChange={position => setBanner({ position })}
            />

            <OptionSelect
              label='Direction'
              value={config.banner.direction}
              options={DIRECTION_OPTIONS}
              onChange={direction => setBanner({ direction })}
            />
            <p className='text-[10px] text-muted-foreground'>
              Use RTL for Urdu and Arabic text, which scrolls the other way.
            </p>

            <div className='space-y-1'>
              <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
                Font
              </Label>
              <Select value={config.banner.font} onValueChange={font => setBanner({ font })}>
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_GROUPS.map(group => (
                    <SelectGroup key={group.category}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {FONTS[group.category].map(f => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>
                Background
              </Label>
              <ColorInput
                value={config.banner.background.color}
                onChange={color => setBannerBackground({ color })}
                className='h-9 w-full p-1'
              />
            </div>
            <Label className='text-xs text-muted-foreground'>
              Opacity: {Math.round(config.banner.background.opacity * 100)}%
            </Label>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[config.banner.background.opacity * 100]}
              onValueChange={v => setBannerBackground({ opacity: v[0] / 100 })}
            />

            <OptionSelect
              label='Speed'
              value={config.banner.speed}
              options={SPEED_OPTIONS}
              onChange={speed => setBanner({ speed })}
            />

            <p className='text-[10px] text-muted-foreground'>
              Banner text size and color are in the Text size and Text colors sections. Text that
              fits the screen stays still instead of scrolling.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

interface OptionSelectProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

function OptionSelect<T extends string>({ label, value, options, onChange }: OptionSelectProps<T>) {
  return (
    <div className='space-y-1'>
      <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>{label}</Label>
      <Select value={value} onValueChange={v => onChange(v as T)}>
        <SelectTrigger className='w-full'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
  label?: string;
  category: 'english' | 'arabic' | 'urdu';
  value: string;
  onChange: (id: string) => void;
}

function FontSelect({ label, category, value, onChange }: FontSelectProps) {
  return (
    <div className='space-y-1'>
      {label && (
        <Label className='text-[10px] text-muted-foreground uppercase tracking-wide'>{label}</Label>
      )}
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
  /** Upper bound of the slider. */
  max?: number;
}

function MultiplierSlider({ label, value, onChange, max = MAX_SCALE }: MultiplierSliderProps) {
  return (
    <div className='space-y-2'>
      <Label className='text-xs text-muted-foreground'>
        {label}: {value.toFixed(2)}×
      </Label>
      <Slider min={0.5} max={max} step={0.05} value={[value]} onValueChange={v => onChange(v[0])} />
    </div>
  );
}
