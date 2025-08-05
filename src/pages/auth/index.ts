import { lazy } from 'react';

export const Login = lazy(() => import('./login'));
export const Register = lazy(() => import('./register'));
export const ForgotPassword = lazy(() => import('./forgot-password'));
export const LoginWithCode = lazy(() => import('./login-with-code'));
