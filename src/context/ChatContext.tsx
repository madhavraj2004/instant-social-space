import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Message, Chat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

// Sample users data
const sampleUsers: User[] = [
  // (same sample users data)
];

// Sample chat data
const sampleChats: Chat[] = [
  // (same sample chat data)
];

// Define the context type
interface ChatContextType {
  currentUser: User | null;
  users: User[];
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat) => void;
  sendMessage: (content: string, fileUrl?: string, fileType?: 'image' | 'document' | 'video') => void;
  createChat: (participants: User[], name?: string) => void;
  readMessages: (chatId: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;

  // Add the initializeUserChats method
  initializeUserChats: (userId: string) => Promise<void>;
}

const defaultContextValue: ChatContextType = {
  currentUser: null,
  users: sampleUsers.slice(1),
  chats: [],
  activeChat: null,
  setActiveChat: () => {},
  sendMessage: () => {},
  createChat: () => {},
  readMessages: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  initializeUserChats: async () => {}, // Provide an empty implementation for the default context
};

export const ChatContext = createContext<ChatContextType>(defaultContextValue);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const user: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
          status: 'online' as const,
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Load user's chats
        initializeUserChats(user.id);
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsAuthenticated(false);
        setChats([]);
      }
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Load user's chats from the server
  const loadUserChats = async (userId: string) => {
    try {
      // Fetch user chats from the server
      const response = await fetch(`/api/chats/${userId}`);
      const chats = await response.json();

      // Update state with fetched chats
      setChats(chats);
    } catch (error) {
      console.error("Error fetching user chats:", error);
    }
  };

  // Make this method available in the context
  const initializeUserChats = async (userId: string) => {
    await loadUserChats(userId);
  };

  const sendMessage = (
    content: string, 
    fileUrl?: string, 
    fileType?: 'image' | 'document' | 'video'
  ) => {
    if (!activeChat || !currentUser) return;
    
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
    if (!currentUser) return;
    
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
    isAuthenticated,
    setIsAuthenticated,
    initializeUserChats, // Expose initializeUserChats in the context
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);