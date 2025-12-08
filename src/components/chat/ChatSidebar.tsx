import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { User, Chat } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, MessageCircle, Search, PlusCircle, Copy, Check, Share2 } from 'lucide-react';
import UserItem from './UserItem';
import UserSearch from './UserSearch';

import { useToast } from '@/hooks/use-toast';

const ChatSidebar = () => {
  const { chats, activeChat, setActiveChat, users, currentUser } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<'chats' | 'users' | 'add-people'>('chats');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const inviteLink = `${window.location.origin}/register`;

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    if (chat.type === 'direct' && chat.name) {
      return chat.name.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (chat.type === 'group' && chat.name) {
      return chat.name.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chat: Chat) => {
    setActiveChat(chat);
  };

  const handleChatCreated = (chatId: string) => {
    setShowUserSearch(false);
    // The chat will be loaded automatically via realtime
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => 
      prev.some(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreateGroupChat = () => {
    if (selectedUsers.length > 0 && newGroupName) {
      // TODO: Create group chat logic
      console.log('Creating group chat:', newGroupName, selectedUsers);
      setNewGroupName('');
      setSelectedUsers([]);
    }
  };

  const handleCreateDirectChat = (user: User) => {
    // TODO: Create direct chat logic
    console.log('Creating direct chat with:', user);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share this link with friends to invite them.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Chat App!',
          text: `${currentUser?.name || 'Someone'} invited you to join Chat App!`,
          url: inviteLink,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const getChatName = (chat: Chat) => {
    if (chat.type === 'group') return chat.name;
    const participant = chat.participants.find(p => p.id !== 'u1');
    return participant?.name;
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'group') {
      return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c';
    }
    const participant = chat.participants.find(p => p.id !== 'u1');
    return participant?.avatar;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-80 border-r h-full flex flex-col bg-sidebar">
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-semibold text-chat-primary">Messages</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <PlusCircle className="h-5 w-5 text-chat-primary" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Select Users</h3>
                <ScrollArea className="h-72">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className={`flex items-center p-2 rounded-md cursor-pointer ${
                        selectedUsers.some(u => u.id === user.id)
                          ? 'bg-chat-secondary'
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleUserSelection(user)}
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <img src={user.avatar} alt={user.name} />
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <Button
                className="w-full bg-chat-primary hover:bg-chat-accent"
                onClick={handleCreateGroupChat}
                disabled={selectedUsers.length === 0 || !newGroupName}
              >
                Create Group Chat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex border-b">
        <button
          className={`flex-1 py-2 flex justify-center items-center space-x-2 ${
            activeTab === 'chats' ? 'text-chat-primary border-b-2 border-chat-primary' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('chats')}
        >
          <MessageCircle className="h-4 w-4" />
          <span>Chats</span>
        </button>
        <button
          className={`flex-1 py-2 flex justify-center items-center space-x-2 ${
            activeTab === 'users' ? 'text-chat-primary border-b-2 border-chat-primary' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="h-4 w-4" />
          <span>Users</span>
        </button>
        <button
          className={`flex-1 py-2 flex justify-center items-center space-x-2 ${
            activeTab === 'add-people' ? 'text-chat-primary border-b-2 border-chat-primary' : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('add-people')}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add People</span>
        </button>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === 'chats' ? (
          <div className="p-2 space-y-1">
            {filteredChats.length > 0 ? (
              filteredChats.map(chat => (
                <div
                  key={chat.id}
                  className={`p-2 rounded-md flex items-center space-x-3 cursor-pointer hover:bg-gray-100 ${
                    activeChat?.id === chat.id ? 'bg-chat-secondary' : ''
                  }`}
                  onClick={() => handleChatClick(chat)}
                >
                  <Avatar className="h-12 w-12">
                    <img src={getChatAvatar(chat)} alt={getChatName(chat)} className="object-cover" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{getChatName(chat)}</h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage.fileUrl ? (
                          <span className="flex items-center">
                            {chat.lastMessage.fileType === 'image' ? '🖼️ Image' : '📁 File'}
                          </span>
                        ) : (
                          chat.lastMessage.content
                        )}
                      </p>
                    )}
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <div className="flex mt-1">
                        <span className="bg-chat-primary text-white text-xs rounded-full px-2 py-0.5">
                          {chat.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">No chats found</div>
            )}
          </div>
        ) : activeTab === 'users' ? (
          <div className="p-2 space-y-1">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <UserItem
                  key={user.id}
                  user={user}
                  onClick={() => handleCreateDirectChat(user)}
                />
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">No users found</div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Invite People</h2>
            <p className="text-sm text-muted-foreground">
              Share this link with friends to invite them to join the chat app.
            </p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Input
                value={inviteLink}
                readOnly
                className="bg-transparent border-none text-sm"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              onClick={handleShare}
              className="w-full bg-chat-primary hover:bg-chat-accent"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Invite Link
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;