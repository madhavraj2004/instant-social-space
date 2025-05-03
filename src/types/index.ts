
export type User = {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastActive?: string;
  password?: string; // Add password field (optional for backwards compatibility)
};

export type Message = {
  type: string;
  senderAvatar: string;
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
  fileUrl?: string;
  fileType?: 'image' | 'document' | 'video';
};

export type Chat = {
  id: string;
  type: 'direct' | 'group';
  name?: string; // Required for group chats
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
};
