import { ContactConversation, Message, Room, User } from '@/types/chat';

export function buildContactConversations(
  users: User[],
  rooms: Room[],
  currentUserId: number
): ContactConversation[] {
  return users
    .filter((user) => user.id !== currentUserId)
    .map((contact) => {
      const room =
        rooms.find((candidateRoom) => {
          return candidateRoom.userA.id === contact.id || candidateRoom.userB.id === contact.id;
        }) ?? null;

      return {
        contact,
        lastMessage: room?.messages?.[0] ?? null,
        room,
        updatedAt: room?.updatedAt ?? null,
      };
    });
}

export function mergeMessageList(messages: Message[], nextMessage: Message) {
  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }

  return [...messages, nextMessage].sort((first, second) => {
    return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
  });
}
