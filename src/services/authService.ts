import axiosInstance from '@/config/axiosInstance';
import { SigninPayload } from '@/types/auth/SigninPayload';
import { SigninResponse } from '@/types/auth/SigninResponse';
import { UpdateUserDetailsPayload } from '@/types/auth/UpdateUserDetailsPayload';
import { User } from '@/types/User';

export const getMe = async (): Promise<User> => {
  try {
    const response = await axiosInstance.get<User>('/users/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendOtp = async (email: string): Promise<void> => {
  try {
    await axiosInstance.post('/users/otp', {
      email: email,
    });
  } catch (error) {
    throw error;
  }
};

export const signup = async (
  payload: SigninPayload
): Promise<SigninResponse> => {
  try {
    const response = await axiosInstance.post('/users', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserDetails = async (
  payload: UpdateUserDetailsPayload
): Promise<void> => {
  try {
    await axiosInstance.patch('/users/update', payload);
  } catch (error) {
    throw error;
  }
};

export type SignInMethod = 'password' | 'otp';

/**
 * Demande à l'API si ce compte se connecte par mot de passe ou par code.
 * Si l'API ne connaît pas encore cette route, on retombe sur le code e-mail.
 */
export const getSignInMethod = async (email: string): Promise<SignInMethod> => {
  try {
    const response = await axiosInstance.post<{ method: SignInMethod }>(
      '/users/signin-method',
      { email }
    );
    return response.data.method === 'password' ? 'password' : 'otp';
  } catch {
    return 'otp';
  }
};

export const signinWithPassword = async (payload: {
  email: string;
  password: string;
}): Promise<SigninResponse> => {
  const response = await axiosInstance.post('/users/signin-password', payload);
  return response.data;
};

export const setPassword = async (password: string): Promise<void> => {
  await axiosInstance.patch('/users/password', { password });
};
