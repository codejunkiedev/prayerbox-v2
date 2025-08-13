import { calculatePasswordStrength, getPasswordStrengthLabel } from '@/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = calculatePasswordStrength(password);
  const { label, color } = getPasswordStrengthLabel(strength);
  const widthPercentage = (strength / 5) * 100;

  return (
    <div className='mt-1 space-y-2'>
      <div className='h-1 w-full bg-gray-200 rounded-full overflow-hidden'>
        <div
          className={`h-full ${color} transition-all duration-300 ease-in-out`}
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
      <p className='text-xs text-muted-foreground'>
        Password strength: <span className='font-medium'>{label}</span>
      </p>
    </div>
  );
}
