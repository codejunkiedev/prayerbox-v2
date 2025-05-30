import { Button } from '@/components/ui';
import { useAutoRedirect } from '@/hooks';

interface AutoRedirectNoticeProps {
  to: string;
  delaySeconds?: number;
  message?: string;
  buttonLabel?: string;
}

export function AutoRedirectNotice({
  to,
  delaySeconds = 5,
  message = 'Operation successful.',
  buttonLabel = 'Go to Home',
}: AutoRedirectNoticeProps) {
  const { secondsLeft, redirectNow } = useAutoRedirect({ to, delaySeconds });

  return (
    <>
      <div className='bg-green-100 border border-green-400 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm mb-2'>
        {message} <br />
        <div className='text-center'>
          Redirecting in <span className='font-semibold'>{secondsLeft}</span> second
          {secondsLeft !== 1 ? 's' : ''}...
        </div>
      </div>
      <Button className='mt-2' onClick={redirectNow}>
        {buttonLabel}
      </Button>
    </>
  );
}
