export type User = {
  id: number;
  username: string;
};

export type Message = {
  content: string;
  createdAt: string;
  deliveredAt: string | null;
  id: number;
  isPublic?: boolean;
  isRead?: boolean;
  readAt: string | null;
  recipient?: User;
  recipientId: number;
  roomId: number;
  sender: User;
  senderId: number;
};

export type Room = {
  id: number;
  messages?: Message[];
  updatedAt: string;
  userA: User;
  userB: User;
};

export type ContactConversation = {
  contact: User;
  lastMessage: Message | null;
  room: Room | null;
  updatedAt: string | null;
};

export type SessionRegisterAck =
  | {
      ok: true;
      pendingMessages: number;
    }
  | {
      error: string;
      ok: false;
    };

export type SendMessageAck =
  | {
      messageId: number;
      ok: true;
      roomId: number;
    }
  | {
      error: string;
      ok: false;
    };

export type MessageSentEvent = {
  message: Message;
  room: Room;
};
