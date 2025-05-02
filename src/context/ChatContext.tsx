
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Message, Chat } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Sample users data
const sampleUsers: User[] = [
  {
    id: 'u1',
    name: 'John Doe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    status: 'online',
  },
  {
    id: 'u2',
    name: 'Jane Smith',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    status: 'online',
  },
  {
    id: 'u3',
    name: 'Mike Johnson',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    status: 'offline',
    lastActive: '1 hour ago',
  },
  {
    id: 'u4',
    name: 'Sarah Williams',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    status: 'away',
  },
  {
    id: 'u5',
    name: 'Development Team',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
    status: 'online',
  },
];

// Sample chat data
const sampleChats: Chat[] = [
  {
    id: 'c1',
    type: 'direct',
    participants: [sampleUsers[0], sampleUsers[1]],
    messages: [
      {
        id: 'm1',
        senderId: 'u2',
        content: 'Hey, how are you?',
        timestamp: '2023-05-01T14:30:00Z',
        read: true,
      },
      {
        id: 'm2',
        senderId: 'u1',
        content: 'I\'m good, thanks! How about you?',
        timestamp: '2023-05-01T14:35:00Z',
        read: true,
      },
      {
        id: 'm3',
        senderId: 'u2',
        content: 'Doing well! Are we still on for the meeting?',
        timestamp: '2023-05-01T14:40:00Z',
        read: false,
      },
    ],
    unreadCount: 1,
  },
  {
    id: 'c2',
    type: 'direct',
    participants: [sampleUsers[0], sampleUsers[2]],
    messages: [
      {
        id: 'm4',
        senderId: 'u3',
        content: 'Did you see the latest project updates?',
        timestamp: '2023-05-01T10:15:00Z',
        read: true,
      },
      {
        id: 'm5',
        senderId: 'u1',
        content: 'Yes, I did. Looks promising!',
        timestamp: '2023-05-01T10:20:00Z',
        read: true,
      },
    ],
  },
  {
    id: 'c3',
    type: 'group',
    name: 'Project Team',
    participants: [sampleUsers[0], sampleUsers[1], sampleUsers[2], sampleUsers[3]],
    messages: [
      {
        id: 'm6',
        senderId: 'u1',
        content: 'When is our next sprint planning?',
        timestamp: '2023-05-01T09:00:00Z',
        read: true,
      },
      {
        id: 'm7',
        senderId: 'u2',
        content: 'Tomorrow at 10 AM',
        timestamp: '2023-05-01T09:05:00Z',
        read: true,
      },
      {
        id: 'm8',
        senderId: 'u3',
        content: 'I\'ll prepare the backlog items.',
        timestamp: '2023-05-01T09:10:00Z',
        read: true,
      },
      {
        id: 'm9',
        senderId: 'u3',
        content: 'Check out this mockup!',
        timestamp: '2023-05-01T09:15:00Z',
        read: true,
        fileUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        fileType: 'image',
      },
    ],
  },
  {
    id: 'c4',
    type: 'group',
    name: 'Design Team',
    participants: [sampleUsers[0], sampleUsers[3], sampleUsers[4]],
    messages: [
      {
        id: 'm10',
        senderId: 'u4',
        content: 'I\'ve updated the design system',
        timestamp: '2023-05-01T16:20:00Z',
        read: true,
      },
      {
        id: 'm11',
        senderId: 'u5',
        content: 'Great work! The colors look better now.',
        timestamp: '2023-05-01T16:25:00Z',
        read: false,
      },
    ],
    unreadCount: 1,
  },
];

// Define the context type
interface ChatContextType {
  currentUser: User;
  users: User[];
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
  sendMessage: (content: string, fileUrl?: string, fileType?: 'image' | 'document' | 'video') => void;
  createChat: (participants: User[], name?: string) => void;
  readMessages: (chatId: string) => void;
  registerUser: (name: string, avatarUrl: string) => void;
  loginUser: (userId: string) => void;
  isAuthenticated: boolean;
}

const defaultContextValue: ChatContextType = {
  currentUser: sampleUsers[0],
  users: sampleUsers.slice(1),
  chats: [],
  activeChat: null,
  setActiveChat: () => {},
  sendMessage: () => {},
  createChat: () => {},
  readMessages: () => {},
  registerUser: () => {},
  loginUser: () => {},
  isAuthenticated: false,
};

export const ChatContext = createContext<ChatContextType>(defaultContextValue);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(sampleUsers[0]);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    const storedChats = localStorage.getItem('chats');
    const storedCurrentUserId = localStorage.getItem('currentUserId');
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
    
    if (storedChats) {
      setChats(JSON.parse(storedChats));
    }
    
    if (storedCurrentUserId) {
      const storedUser = JSON.parse(storedUsers || '[]').find((u: User) => u.id === storedCurrentUserId);
      if (storedUser) {
        setCurrentUser(storedUser);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Save users and chats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('chats', JSON.stringify(chats));
  }, [chats]);

  // Update active chat when chats change
  useEffect(() => {
    if (activeChat) {
      const updatedActiveChat = chats.find(chat => chat.id === activeChat.id);
      if (updatedActiveChat) {
        setActiveChat(updatedActiveChat);
      }
    }
  }, [chats, activeChat]);

  const registerUser = (name: string, avatarUrl: string) => {
    // Check if user with this name already exists
    if (users.some(user => user.name.toLowerCase() === name.toLowerCase())) {
      throw new Error("A user with this name already exists");
    }
    
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      avatar: avatarUrl,
      status: 'online', // Use a valid status value
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    localStorage.setItem('currentUserId', newUser.id);
    setIsAuthenticated(true);
    
    return newUser;
  };

  const loginUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update user status to online - ensure we're using a valid status value
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, status: 'online' as const } : u
    );
    
    setUsers(updatedUsers);
    setCurrentUser(user);
    localStorage.setItem('currentUserId', userId);
    setIsAuthenticated(true);
  };

  const sendMessage = (
    content: string, 
    fileUrl?: string, 
    fileType?: 'image' | 'document' | 'video'
  ) => {
    if (!activeChat) return;
    
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      fileUrl,
      fileType,
    };

    const updatedChats = chats.map(chat => {
      if (chat.id === activeChat.id) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage,
        };
      }
      return chat;
    });

    setChats(updatedChats);
  };

  const createChat = (participants: User[], name?: string) => {
    // Check if direct chat already exists
    if (participants.length === 1) {
      const existingChat = chats.find(
        chat => 
          chat.type === 'direct' && 
          chat.participants.some(p => p.id === participants[0].id)
      );
      
      if (existingChat) {
        setActiveChat(existingChat);
        return;
      }
    }

    const chatParticipants = [currentUser, ...participants];
    const newChat: Chat = {
      id: `c${Date.now()}`,
      type: participants.length === 1 ? 'direct' : 'group',
      name: participants.length === 1 ? undefined : name,
      participants: chatParticipants,
      messages: [],
    };

    const updatedChats = [...chats, newChat];
    setChats(updatedChats);
    setActiveChat(newChat);

    toast({
      title: "Chat created",
      description: participants.length === 1 
        ? `Chat with ${participants[0].name} started` 
        : `Group "${name}" created`,
    });
  };

  const readMessages = (chatId: string) => {
    const updatedChats = chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: chat.messages.map(msg => ({
            ...msg,
            read: true
          })),
          unreadCount: 0
        };
      }
      return chat;
    });

    setChats(updatedChats);
  };

  const value = {
    currentUser,
    users,
    chats,
    activeChat,
    setActiveChat,
    sendMessage,
    createChat,
    readMessages,
    registerUser,
    loginUser,
    isAuthenticated,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
