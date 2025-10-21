import { requestService } from '@/services';
import { User } from '@/types/userTypes';

export function register(email: string, password: string) {
  return requestService<User>({
    url: '/auth/register',
    method: 'POST',
    data: { email, password }
  });
}

export function login(email: string, password: string) {
  return requestService<User>({
    url: '/auth/login',
    method: 'POST',
    data: { email, password }
  });
}

export function me() {
  return requestService<User>({ url: '/auth/me', method: 'GET' });
}

export function logout() {
  return requestService({ url: '/auth/logout', method: 'POST' });
}

export function forgotPassword(email: string) {
  return requestService({ url: '/auth/forgot-password', method: 'POST', data: { email } });
}

export function resetPassword(token: string, password: string) {
  return requestService({
    url: `/auth/reset-password/${token}`,
    method: 'POST',
    data: { password }
  });
}

export function deleteUser(email: string, password: string) {
  return requestService({
    url: '/auth',
    method: 'DELETE',
    data: { email, password }
  });
}
