import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { loginFormSchema, type LoginFormData } from '@/lib/zod';
import { Link } from 'react-router';
import supabase from '@/lib/supabase';
import toast from 'react-hot-toast';
import { AuthRoutes } from '@/constants';

export default function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success('Login Successful');
    } catch (err) {
      console.error('Error during login:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = () => {
    if (errorMessage) setErrorMessage('');
  };

  return (
    <div className="container flex h-screen w-full flex-col items-center justify-center px-4 md:px-6">
      <div className="mx-auto flex w-full flex-col justify-center space-y-4 sm:space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground">Enter your credentials to sign in</p>
        </div>
        <div className="grid gap-4 sm:gap-6">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded text-sm">
              {errorMessage}
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-3 sm:gap-4">
              <div className="grid gap-1 sm:gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className={cn(errors.email && 'border-red-500')}
                  placeholder="name@example.com"
                  {...register('email', {
                    onChange: handleInputChange,
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-1 sm:gap-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={cn(errors.password && 'border-red-500')}
                    {...register('password', {
                      onChange: handleInputChange,
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
                <div className="text-right">
                  <Link
                    to={AuthRoutes.ForgotPassword}
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="mt-2">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link
              to={AuthRoutes.Register}
              className="underline underline-offset-4 hover:text-primary"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
