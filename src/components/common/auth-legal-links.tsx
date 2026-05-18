import { Link } from 'react-router';
import { PublicRoutes } from '@/constants';

export function AuthLegalLinks() {
  return (
    <div className='text-center text-xs text-muted-foreground'>
      By continuing, you agree to our{' '}
      <Link
        to={PublicRoutes.TermsConditions}
        className='underline underline-offset-2 hover:text-primary'
      >
        Terms
      </Link>{' '}
      and{' '}
      <Link
        to={PublicRoutes.PrivacyPolicy}
        className='underline underline-offset-2 hover:text-primary'
      >
        Privacy Policy
      </Link>
      .
    </div>
  );
}
