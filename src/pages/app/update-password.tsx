import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, ErrorBox } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { updateUserPasswordWithVerification, getCurrentUser } from '@/lib/supabase';
import { toast } from 'sonner';
import { AppRoutes } from '@/constants';
import { updatePasswordSchema, type UpdatePasswordData } from '@/lib/zod';
import { AutoRedirectNotice } from '@/components/AutoRedirectNotice';

export default function UpdatePassword() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState({ old: false, new: false, confirm: false });
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user's email
    const fetchUserEmail = async () => {
      try {
        const user = await getCurrentUser();
        if (user && user.email) {
          setUserEmail(user.email);
        } else {
          setErrorMessage('You must be logged in to update your password');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setErrorMessage('Error fetching user information');
      }
    };

    fetchUserEmail();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: UpdatePasswordData) => {
    try {
      if (!userEmail) {
        setErrorMessage('User email not found. Please try logging in again.');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      // Verify old password and update to new password
      await updateUserPasswordWithVerification(userEmail, data.oldPassword, data.password);

      setIsSuccess(true);
      toast.success('Password updated successfully');
    } catch (err) {
      console.error('Error during password update:', err);
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to update password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className='container flex h-full w-full flex-col items-center justify-center px-4 md:px-6'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-4 sm:space-y-6 sm:w-[350px]'>
        <div className='flex flex-col space-y-2 text-center'>
          <h1 className='text-xl sm:text-2xl font-semibold tracking-tight'>Update your password</h1>
          <p className='text-sm text-muted-foreground'>
            Enter your current password and new password below
          </p>
        </div>
        <div className='grid gap-4 sm:gap-6'>
          {errorMessage && <ErrorBox message={errorMessage} />}
          {isSuccess ? (
            <AutoRedirectNotice
              to={AppRoutes.Home}
              delaySeconds={5}
              message={
                'Your password has been updated successfully. You may need to log in again with your new password.'
              }
              buttonLabel='Go to Home'
            />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='grid gap-3 sm:gap-4'>
                <div className='grid gap-1 sm:gap-2'>
                  <Label htmlFor='oldPassword'>Current Password</Label>
                  <div className='relative'>
                    <Input
                      id='oldPassword'
                      type={showPassword.old ? 'text' : 'password'}
                      className={cn(errors.oldPassword && 'border-red-500')}
                      {...register('oldPassword', {
                        onChange: handleInputChange,
                      })}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0'
                      onClick={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
                      tabIndex={-1}
                    >
                      {showPassword.old ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  {errors.oldPassword && (
                    <p className='text-xs text-red-500 mt-1'>{errors.oldPassword.message}</p>
                  )}
                </div>
                <div className='grid gap-1 sm:gap-2'>
                  <Label htmlFor='password'>New Password</Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      type={showPassword.new ? 'text' : 'password'}
                      className={cn(errors.password && 'border-red-500')}
                      {...register('password', {
                        onChange: handleInputChange,
                      })}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0'
                      onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      tabIndex={-1}
                    >
                      {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className='text-xs text-red-500 mt-1'>{errors.password.message}</p>
                  )}
                </div>
                <div className='grid gap-1 sm:gap-2'>
                  <Label htmlFor='confirmPassword'>Confirm New Password</Label>
                  <div className='relative'>
                    <Input
                      id='confirmPassword'
                      type={showPassword.confirm ? 'text' : 'password'}
                      className={cn(errors.confirmPassword && 'border-red-500')}
                      {...register('confirmPassword', {
                        onChange: handleInputChange,
                      })}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0'
                      onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      tabIndex={-1}
                    >
                      {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className='text-xs text-red-500 mt-1'>{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type='submit' loading={isLoading} className='mt-2'>
                  {isLoading ? 'Updating password...' : 'Update password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
