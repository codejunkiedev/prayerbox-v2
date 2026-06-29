import { useId } from 'react';
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
} from '@/components/ui';
import { FONTS } from '@/constants';
import {
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

  const visibleColumnCount = COLUMN_TOGGLES.filter(c => config.visibility[c.key]).length;

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
