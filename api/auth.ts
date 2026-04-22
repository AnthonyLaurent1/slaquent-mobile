import { fetchWithJson } from '@/api/client';
import { User } from '@/types/chat';

export function listUsers() {
  return fetchWithJson<User[]>('/users');
}

export function registerUser(username: string) {
  return fetchWithJson<User>('/users/register', {
    body: { username },
    method: 'POST',
  });
}
