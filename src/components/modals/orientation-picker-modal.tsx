import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui';
import type { ScreenOrientation } from '@/types';
import { cn } from '@/utils';

const ORIENTATION_CONFIG: Record<
  ScreenOrientation,
  { label: string; dimensions: string; shape: { w: string; h: string } }
> = {
  landscape: { label: 'Landscape', dimensions: '1920 × 1080', shape: { w: 'w-32', h: 'h-20' } },
  portrait: { label: 'Portrait', dimensions: '1080 × 1920', shape: { w: 'w-20', h: 'h-32' } },
  mobile: { label: 'Mobile', dimensions: '1080 × 1920', shape: { w: 'w-16', h: 'h-28' } },
};

interface OrientationPickerModalProps<T extends ScreenOrientation> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  itemLabel: string;
  orientations: readonly T[];
  defaultValue?: T;
  onSelect: (orientation: T) => void;
}

export function OrientationPickerModal<T extends ScreenOrientation>({
  open,
  onOpenChange,
  title,
  itemLabel,
  orientations,
  defaultValue,
  onSelect,
}: OrientationPickerModalProps<T>) {
  const [value, setValue] = useState<T>(defaultValue ?? orientations[0]);

  const gridCols = orientations.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

  const handleCancel = () => onOpenChange(false);
  const handleContinue = () => {
    onOpenChange(false);
    onSelect(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <p className='text-sm text-muted-foreground'>
            Choose the screen type this {itemLabel} is for. This cannot be changed later.
          </p>

          <RadioGroup
            value={value}
            onValueChange={v => setValue(v as T)}
            className={cn('grid gap-3', gridCols)}
          >
            {orientations.map(o => {
              const cfg = ORIENTATION_CONFIG[o];
              const id = `orientation-${o}`;
              return (
                <Label
                  key={o}
                  htmlFor={id}
                  className='flex flex-col items-center gap-3 border rounded-md p-6 cursor-pointer hover:bg-accent transition'
                >
                  <RadioGroupItem id={id} value={o} />
                  <div className={cn('bg-muted rounded', cfg.shape.w, cfg.shape.h)} />
                  <span className='font-medium'>{cfg.label}</span>
                  <span className='text-xs text-muted-foreground'>{cfg.dimensions}</span>
                </Label>
              );
            })}
          </RadioGroup>

          <div className='flex justify-end gap-2'>
            <Button type='button' variant='outline' onClick={handleCancel}>
              Cancel
            </Button>
            <Button type='button' onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
