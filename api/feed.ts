import { fetchWithJson } from '@/api/client';
import { Message } from '@/types/chat';

export function listFeed(params = '') {
  const query = params ? `?${params}` : '';
  return fetchWithJson<Message[]>(`/feed${query}`);
}
