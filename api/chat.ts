import { fetchWithJson } from '@/api/client';
import { Message, Room } from '@/types/chat';

export function listRooms(userId: number) {
  return fetchWithJson<Room[]>(`/users/${userId}/rooms`);
}

export function createOrGetRoom(currentUserId: number, targetUserId: number) {
  return fetchWithJson<Room>('/rooms', {
    body: { currentUserId, targetUserId },
    method: 'POST',
  });
}

export function listMessages(roomId: number, userId: number, limit = 50) {
  return fetchWithJson<Message[]>(`/rooms/${roomId}/messages?userId=${userId}&limit=${limit}`);
}
