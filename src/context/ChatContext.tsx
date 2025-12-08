import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Message, Chat } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (content: string, fileUrl?: string, fileType?: 'image' | 'document' | 'video') => void;
  uploadFile: (file: File) => Promise<{ url: string; type: 'image' | 'document' | 'video' } | null>;
  createChat: (participants: User[], name?: string) => Promise<Chat | null>;
  startDirectChat: (userId: string) => Promise<Chat | null>;
  readMessages: (chatId: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  isLoading: boolean;
  initializeUserChats: (userId: string) => Promise<void>;
}

const defaultContextValue: ChatContextType = {
  currentUser: null,
  users: [],
  chats: [],
  activeChat: null,
  setActiveChat: () => {},
  sendMessage: () => {},
  uploadFile: async () => null,
  createChat: async () => null,
  startDirectChat: async () => null,
  readMessages: () => {},
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  isLoading: true,
  initializeUserChats: async () => {},
};

export const ChatContext = createContext<ChatContextType>(defaultContextValue);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Listen to Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setChats([]);
        setIsLoading(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Load user profile from Supabase
  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        const user: User = {
          id: profile.id,
          name: profile.display_name || 'User',
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
          status: (profile.status as User['status']) || 'online',
        };
        
        setCurrentUser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
        
        // Load user's chats
        initializeUserChats(user.id);
        
        // Load all users
        loadAllUsers();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setIsLoading(false);
    }
  };

  // Load all users from Supabase
  const loadAllUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (profiles) {
        const allUsers: User[] = profiles.map(profile => ({
          id: profile.id,
          name: profile.display_name || 'User',
          avatar: profile.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80',
          status: (profile.status as User['status']) || 'offline',
        }));
        
        setUsers(allUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load user's chats from Supabase
  const loadUserChats = async (userId: string) => {
    try {
      // Fetch user's chat participants
      const { data: chatParticipants } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', userId);

      if (!chatParticipants || chatParticipants.length === 0) {
        setChats([]);
        return;
      }

      const chatIds = chatParticipants.map(cp => cp.chat_id);

      // Fetch chats with their participants and messages
      const { data: chatsData } = await supabase
        .from('chats')
        .select(`
          id,
          type,
          name,
          created_at,
          chat_participants!inner(
            profiles(id, display_name, avatar_url, status)
          ),
          messages(
            id,
            content,
            created_at,
            read,
            file_url,
            file_type,
            sender_id,
            profiles!messages_sender_id_fkey(id, display_name, avatar_url)
          )
        `)
        .in('id', chatIds)
        .order('created_at', { ascending: false });

      if (chatsData) {
        const formattedChats: Chat[] = chatsData.map((chat: any) => {
          const participants = chat.chat_participants
            .map((cp: any) => cp.profiles)
            .filter((p: any) => p)
            .map((p: any) => ({
              id: p.id,
              name: p.display_name || 'User',
              avatar: p.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
              status: p.status || 'offline',
            }));

          const messages = (chat.messages || [])
            .map((m: any) => ({
              id: m.id,
              senderId: m.sender_id,
              senderAvatar: m.profiles?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
              type: m.file_type || 'text',
              content: m.content,
              timestamp: m.created_at,
              read: m.read,
              fileUrl: m.file_url,
              fileType: m.file_type,
            }))
            .sort((a: Message, b: Message) => 
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
            );

          return {
            id: chat.id,
            type: chat.type,
            name: chat.name,
            participants,
            messages,
            lastMessage: messages[messages.length - 1],
            unreadCount: messages.filter((m: Message) => !m.read && m.senderId !== userId).length,
          };
        });

        setChats(formattedChats);
      }
    } catch (error) {
      console.error("Error fetching user chats:", error);
    }
  };

  // Make this method available in the context
  const initializeUserChats = async (userId: string) => {
    await loadUserChats(userId);
  };

  // Subscribe to realtime message updates
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Find the chat that this message belongs to
          const chatId = (payload.new as any).chat_id;
          const chat = chats.find(c => c.id === chatId);
          
          if (chat) {
            // Fetch the sender's profile
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('avatar_url')
              .eq('id', (payload.new as any).sender_id)
              .single();

            const newMessage: Message = {
              id: (payload.new as any).id,
              senderId: (payload.new as any).sender_id,
              senderAvatar: senderProfile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
              type: (payload.new as any).file_type || 'text',
              content: (payload.new as any).content,
              timestamp: (payload.new as any).created_at,
              read: (payload.new as any).read,
              fileUrl: (payload.new as any).file_url,
              fileType: (payload.new as any).file_type,
            };

            // Update the chat with the new message
            setChats(prevChats => 
              prevChats.map(c => 
                c.id === chatId
                  ? {
                      ...c,
                      messages: [...c.messages, newMessage],
                      lastMessage: newMessage,
                      unreadCount: newMessage.senderId !== currentUser.id 
                        ? (c.unreadCount || 0) + 1 
                        : c.unreadCount,
                    }
                  : c
              )
            );

            // Update active chat if it's the one that received the message
            if (activeChat?.id === chatId) {
              setActiveChat(prev => 
                prev ? {
                  ...prev,
                  messages: [...prev.messages, newMessage],
                  lastMessage: newMessage,
                } : null
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, chats, activeChat]);

  const uploadFile = async (file: File): Promise<{ url: string; type: 'image' | 'document' | 'video' } | null> => {
    if (!currentUser) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      // Determine file type
      let fileType: 'image' | 'document' | 'video' = 'document';
      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type.startsWith('video/')) {
        fileType = 'video';
      }

      return { url: publicUrl, type: fileType };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file.",
        variant: "destructive",
      });
      return null;
    }
  };

  const sendMessage = async (
    content: string, 
    fileUrl?: string, 
    fileType?: 'image' | 'document' | 'video'
  ) => {
    if (!activeChat || !currentUser) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChat.id,
          sender_id: currentUser.id,
          content,
          file_url: fileUrl,
          file_type: fileType,
        });

      if (error) throw error;

      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  };

  const createChat = async (participants: User[], name?: string): Promise<Chat | null> => {
    if (!currentUser) return null;
    
    try {
      const chatType = participants.length === 1 ? 'direct' : 'group';
      
      // Create the chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .insert({
          type: chatType,
          name: chatType === 'group' ? name : null,
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add all participants including current user
      const participantInserts = [currentUser, ...participants].map(p => ({
        chat_id: chatData.id,
        user_id: p.id,
      }));

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participantInserts);

      if (participantsError) throw participantsError;

      // Create the chat object
      const newChat: Chat = {
        id: chatData.id,
        type: chatType,
        name: chatType === 'group' ? name : participants[0].name,
        participants: [currentUser, ...participants],
        messages: [],
      };

      setChats(prev => [newChat, ...prev]);
      setActiveChat(newChat);

      toast({
        title: "Chat created",
        description: participants.length === 1 
          ? `Chat with ${participants[0].name} started` 
          : `Group "${name}" created`,
      });

      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast({
        title: "Error",
        description: "Failed to create chat.",
        variant: "destructive",
      });
      return null;
    }
  };

  const startDirectChat = async (userId: string): Promise<Chat | null> => {
    if (!currentUser || userId === currentUser.id) return null;

    // Check if direct chat already exists
    const existingChat = chats.find(
      chat => 
        chat.type === 'direct' && 
        chat.participants.some(p => p.id === userId) &&
        chat.participants.some(p => p.id === currentUser.id)
    );
    
    if (existingChat) {
      setActiveChat(existingChat);
      return existingChat;
    }

    // Find the user to chat with
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return null;
    }

    return createChat([targetUser]);
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
    uploadFile,
    createChat,
    startDirectChat,
    readMessages,
    isAuthenticated,
    setIsAuthenticated,
    isLoading,
    initializeUserChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);