import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, ErrorBox, PasswordStrengthMeter } from '@/components/ui';
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
    watch,
  } = useForm<UpdatePasswordData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { oldPassword: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data: UpdatePasswordData) => {
    try {
      if (!userEmail) {
        setErrorMessage('User email not found. Please try logging in again.');
        return;
      }
      setIsLoading(true);
      setErrorMessage('');
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
    <div className='container mx-auto px-4 py-8 max-w-2xl'>
      <h1 className='text-2xl font-bold mb-6'>Update Password</h1>

      {errorMessage && <ErrorBox message={errorMessage} className='mb-6' />}

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
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-2'>
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
                className='absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0'
                onClick={() => setShowPassword(prev => ({ ...prev, old: !prev.old }))}
                tabIndex={-1}
              >
                {showPassword.old ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {errors.oldPassword && (
              <p className='text-red-500 text-sm mt-1'>{errors.oldPassword.message}</p>
            )}
          </div>

          <div className='space-y-2'>
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
                className='absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0'
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                tabIndex={-1}
              >
                {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {password && <PasswordStrengthMeter password={password} />}
            {errors.password && (
              <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>
            )}
          </div>

          <div className='space-y-2'>
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
                className='absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0'
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                tabIndex={-1}
              >
                {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type='submit' loading={isLoading}>
            {isLoading ? 'Updating password...' : 'Update Password'}
          </Button>
        </form>
      )}
    </div>
  );
}
