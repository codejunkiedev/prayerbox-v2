import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Minus, ArrowRight } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Slider,
  TimePicker,
} from '@/components/ui';
import { updateSunriseSunsetAdjustments } from '@/lib/supabase';
import { applySingleAdjustment, parseTimeString, formatTimeString } from '@/utils';
import type { Settings, SingleAdjustment } from '@/types';

interface SunriseSunsetModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings | null;
  onSettingsChange: (settings: Settings) => void;
  todaySunrise?: string;
  todaySunset?: string;
}

type AdjustmentType = SingleAdjustment['type'];

const DEFAULT_ADJUSTMENT: SingleAdjustment = { type: 'default' };

interface ControlsProps {
  idPrefix: string;
  value: SingleAdjustment;
  onChange: (next: SingleAdjustment) => void;
  disabled?: boolean;
}

function AdjustmentControls({ idPrefix, value, onChange, disabled }: ControlsProps) {
  const type = value.type;
  const offset = value.offset ?? 0;
  const manualTime = value.manual_time ?? '';

  const handleTypeChange = (next: AdjustmentType) => {
    if (next === 'default') onChange({ type: 'default' });
    else if (next === 'offset') onChange({ type: 'offset', offset: value.offset ?? 0 });
    else onChange({ type: 'manual', manual_time: value.manual_time ?? '' });
  };

  const absOffset = Math.abs(offset);
  const hours = Math.floor(absOffset / 60);
  const minutes = absOffset % 60;

  return (
    <div className='space-y-3 pt-2'>
      <RadioGroup
        value={type}
        onValueChange={v => handleTypeChange(v as AdjustmentType)}
        className='flex flex-row gap-4'
        disabled={disabled}
      >
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='default' id={`${idPrefix}-default`} />
          <Label htmlFor={`${idPrefix}-default`}>Default</Label>
        </div>
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='offset' id={`${idPrefix}-offset`} />
          <Label htmlFor={`${idPrefix}-offset`}>Offset</Label>
        </div>
        <div className='flex items-center space-x-2'>
          <RadioGroupItem value='manual' id={`${idPrefix}-manual`} />
          <Label htmlFor={`${idPrefix}-manual`}>Manual</Label>
        </div>
      </RadioGroup>

      {type === 'offset' && (
        <div className='space-y-3'>
          <div className='flex flex-row justify-between items-start gap-2'>
            <Label>
              {offset > 0 ? '+' : offset < 0 ? '-' : ''}
              {hours > 0 ? `${hours.toString().padStart(2, '0')}h ` : ''}
              {minutes.toString().padStart(2, '0')}m
            </Label>
            <div className='flex items-center gap-1 text-xs'>
              <Minus className='h-3 w-3 text-muted-foreground' />
              <span className='text-muted-foreground'>Earlier</span>
              <span className='mx-1'>|</span>
              <span className='text-muted-foreground'>Later</span>
              <Plus className='h-3 w-3 text-muted-foreground' />
            </div>
          </div>
          <Slider
            value={[offset]}
            min={-120}
            max={120}
            step={1}
            disabled={disabled}
            onValueChange={v => onChange({ type: 'offset', offset: v[0] })}
          />
        </div>
      )}

      {type === 'manual' && (
        <div className='space-y-2'>
          <Label htmlFor={`${idPrefix}-manual-time`}>Select Time</Label>
          <TimePicker
            time={parseTimeString(manualTime)}
            setTime={t => onChange({ type: 'manual', manual_time: formatTimeString(t) })}
            disabled={disabled}
            minuteInterval={1}
          />
        </div>
      )}
    </div>
  );
}

interface TodayPreviewProps {
  rawTime: string;
  adjustment: SingleAdjustment;
}

function TodayPreview({ rawTime, adjustment }: TodayPreviewProps) {
  if (!rawTime) return null;
  const adjusted = applySingleAdjustment(rawTime, adjustment);
  const defaultTime = applySingleAdjustment(rawTime, { type: 'default' });
  const isAdjusted = adjustment.type !== 'default' && adjusted !== defaultTime;

  return (
    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
      <span className='uppercase tracking-wide'>Today</span>
      {isAdjusted ? (
        <>
          <span className='line-through tabular-nums'>{defaultTime}</span>
          <ArrowRight className='h-3 w-3' />
          <span className='font-semibold text-foreground tabular-nums'>{adjusted}</span>
        </>
      ) : (
        <span className='font-semibold text-foreground tabular-nums'>{adjusted}</span>
      )}
    </div>
  );
}

export function SunriseSunsetModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  todaySunrise,
  todaySunset,
}: SunriseSunsetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sunrise, setSunrise] = useState<SingleAdjustment>(
    settings?.sunrise_adjustment ?? DEFAULT_ADJUSTMENT
  );
  const [sunset, setSunset] = useState<SingleAdjustment>(
    settings?.sunset_adjustment ?? DEFAULT_ADJUSTMENT
  );

  useEffect(() => {
    if (!isOpen) return;
    setSunrise(settings?.sunrise_adjustment ?? DEFAULT_ADJUSTMENT);
    setSunset(settings?.sunset_adjustment ?? DEFAULT_ADJUSTMENT);
  }, [isOpen, settings]);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const updated = await updateSunriseSunsetAdjustments(sunrise, sunset);
      onSettingsChange(updated);
      toast.success('Sunrise & sunset adjustments updated');
      onClose();
    } catch (error) {
      console.error('Error updating sunrise/sunset adjustments:', error);
      toast.error('Failed to update sunrise & sunset adjustments');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && !isSubmitting && onClose()}>
      <DialogContent className='sm:max-w-[560px] max-w-[95vw] w-full max-h-[90vh] overflow-y-auto scrollbar-custom'>
        <DialogHeader>
          <DialogTitle>Sunrise &amp; Sunset Adjustment</DialogTitle>
          <DialogDescription>
            Override the computed sunrise and sunset times shown on the display. Apply a fixed
            offset or set a manual time.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4 py-2'>
          <div className='rounded-lg border p-4 space-y-1'>
            <div className='flex items-center justify-between gap-3'>
              <Label className='text-sm font-semibold'>Sunrise</Label>
              {todaySunrise && <TodayPreview rawTime={todaySunrise} adjustment={sunrise} />}
            </div>
            <AdjustmentControls
              idPrefix='sunrise'
              value={sunrise}
              onChange={setSunrise}
              disabled={isSubmitting}
            />
          </div>

          <div className='rounded-lg border p-4 space-y-1'>
            <div className='flex items-center justify-between gap-3'>
              <Label className='text-sm font-semibold'>Sunset</Label>
              {todaySunset && <TodayPreview rawTime={todaySunset} adjustment={sunset} />}
            </div>
            <AdjustmentControls
              idPrefix='sunset'
              value={sunset}
              onChange={setSunset}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter className='flex flex-col sm:flex-row gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>
          <Button
            type='button'
            onClick={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
