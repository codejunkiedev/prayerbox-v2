import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, ErrorBox } from '@/components/ui';
import { cn } from '@/lib/utils';
import { forgotPasswordSchema, type ForgotPasswordData } from '@/lib/zod';
import { Link } from 'react-router';
import { resetPasswordForEmail } from '@/lib/supabase';
import { toast } from 'sonner';
import { AuthRoutes } from '@/constants';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      await resetPasswordForEmail(data.email);

      setIsSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      console.error('Error during password reset:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send reset link');
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
          <h1 className='text-xl sm:text-2xl font-semibold tracking-tight'>Reset your password</h1>
          <p className='text-sm text-muted-foreground'>
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        <div className='grid gap-4 sm:gap-6'>
          {errorMessage && <ErrorBox message={errorMessage} />}
          {isSubmitted ? (
            <div className='bg-green-100 border border-green-400 text-green-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm'>
              Check your email for a link to reset your password. If it doesn't appear within a few
              minutes, check your spam folder.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='grid gap-3 sm:gap-4'>
                <div className='grid gap-1 sm:gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    className={cn(errors.email && 'border-red-500')}
                    placeholder='name@example.com'
                    {...register('email', {
                      onChange: handleInputChange,
                    })}
                  />
                  {errors.email && (
                    <p className='text-xs text-red-500 mt-1'>{errors.email.message}</p>
                  )}
                </div>
                <Button type='submit' loading={isLoading} className='mt-2'>
                  {isLoading ? 'Sending link...' : 'Send reset link'}
                </Button>
              </div>
            </form>
          )}
          <div className='text-center text-sm'>
            Remember your password?{' '}
            <Link to={AuthRoutes.Login} className='underline underline-offset-4 hover:text-primary'>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
