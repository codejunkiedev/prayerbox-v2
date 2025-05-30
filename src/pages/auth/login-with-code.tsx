import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, ErrorBox } from '@/components/ui';
import { cn } from '@/lib/utils';
import { loginWithCodeSchema, type LoginWithCodeData } from '@/lib/zod';
import { Link } from 'react-router';
import { getMasjidByCode } from '@/lib/supabase/services/masjid-profile';
import { AuthRoutes } from '@/constants';
import { useDisplayStore } from '@/store';

export default function LoginWithCode() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { setLoggedIn, setMasjidProfile } = useDisplayStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginWithCodeData>({
    resolver: zodResolver(loginWithCodeSchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data: LoginWithCodeData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const masjid = await getMasjidByCode(data.code);

      if (!masjid) {
        setErrorMessage('Invalid masjid code. Please check and try again.');
        return;
      }

      setMasjidProfile(masjid);
      setLoggedIn(true);
    } catch (err) {
      console.error('Error during login with code:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className='flex h-screen w-full flex-col items-center justify-center px-4 md:px-6'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-4 sm:space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-xl sm:text-2xl font-semibold tracking-tight'>
            Login with Masjid Code
          </h1>
          <p className='text-sm text-muted-foreground'>Enter the masjid code to view the display</p>
        </div>
        <div className='grid gap-4 sm:gap-6'>
          {errorMessage && <ErrorBox message={errorMessage} />}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='grid gap-3 sm:gap-4'>
              <div className='grid gap-1 sm:gap-2'>
                <Label htmlFor='code'>Masjid Code</Label>
                <Input
                  id='code'
                  type='text'
                  className={cn(errors.code && 'border-red-500')}
                  placeholder='Enter masjid code'
                  {...register('code', { onChange: handleInputChange })}
                />
                {errors.code && <p className='text-xs text-red-500 mt-1'>{errors.code.message}</p>}
              </div>
              <Button type='submit' loading={isLoading} className='mt-2'>
                {isLoading ? 'Checking...' : 'Continue'}
              </Button>
              <Button type='button' variant='link'>
                <Link to={AuthRoutes.Login}>Login with email and password</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
