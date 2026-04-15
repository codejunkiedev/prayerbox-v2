import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
} from '@/components/ui';
import { BACKGROUNDS, FONTS } from '@/constants';
import type { AyatHadithStyle } from '@/types';
import { cn } from '@/utils';

interface DesignPanelProps {
  style: AyatHadithStyle;
  onChange: (next: AyatHadithStyle) => void;
  showUrdu: boolean;
  showEnglish: boolean;
}

export function DesignPanel({ style, onChange, showUrdu, showEnglish }: DesignPanelProps) {
  const update = (patch: Partial<AyatHadithStyle>) => onChange({ ...style, ...patch });

  return (
    <div className='space-y-6'>
      <section className='space-y-2'>
        <Label>Background</Label>
        <div className='grid grid-cols-4 gap-2'>
          {BACKGROUNDS.map(bg => {
            const bgStyle =
              bg.type === 'image'
                ? { backgroundImage: `url(${bg.value})`, backgroundSize: 'cover' }
                : bg.type === 'gradient'
                  ? { backgroundImage: bg.value }
                  : { backgroundColor: bg.value };
            return (
              <button
                key={bg.id}
                type='button'
                onClick={() => update({ background_id: bg.id })}
                className={cn(
                  'aspect-video rounded border-2 transition cursor-pointer',
                  style.background_id === bg.id
                    ? 'border-primary ring-2 ring-primary/40'
                    : 'border-transparent hover:border-muted-foreground/50'
                )}
                style={bgStyle}
                title={bg.label}
              />
            );
          })}
        </div>
      </section>

      <section className='space-y-2'>
        <Label>Overlay</Label>
        <div className='flex items-center gap-3'>
          <Input
            type='color'
            value={style.overlay_color}
            onChange={e => update({ overlay_color: e.target.value })}
            className='h-9 w-14 p-1'
          />
          <div className='flex-1'>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[style.overlay_opacity * 100]}
              onValueChange={v => update({ overlay_opacity: v[0] / 100 })}
            />
          </div>
          <span className='text-xs text-muted-foreground w-10 text-right'>
            {Math.round(style.overlay_opacity * 100)}%
          </span>
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
    </div>
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
  const fontOptions = FONTS[category];

  return (
    <section className='space-y-3 border-t pt-4'>
      <Label className='text-sm font-semibold'>{label}</Label>
      <div className='space-y-2'>
        <Label className='text-xs text-muted-foreground'>Font</Label>
        <Select value={style.font_id} onValueChange={v => onChange({ ...style, font_id: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map(f => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex items-center gap-3'>
        <div className='flex-1 space-y-2'>
          <Label className='text-xs text-muted-foreground'>Size: {style.size}px</Label>
          <Slider
            min={16}
            max={200}
            step={2}
            value={[style.size]}
            onValueChange={v => onChange({ ...style, size: v[0] })}
          />
        </div>
        <div className='space-y-2'>
          <Label className='text-xs text-muted-foreground'>Color</Label>
          <Input
            type='color'
            value={style.color}
            onChange={e => onChange({ ...style, color: e.target.value })}
            className='h-9 w-14 p-1'
          />
        </div>
      </div>
      <div className='space-y-2'>
        <Label className='text-xs text-muted-foreground'>
          Line spacing: {style.line_height.toFixed(1)}
        </Label>
        <Slider
          min={1}
          max={3}
          step={0.1}
          value={[style.line_height]}
          onValueChange={v => onChange({ ...style, line_height: v[0] })}
        />
      </div>
    </section>
  );
}
