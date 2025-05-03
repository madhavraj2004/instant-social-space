
import React, { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { User, Chat } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, MessageCircle, Search, PlusCircle, Mail } from 'lucide-react';
import UserItem from './UserItem';
import { useToast } from '@/hooks/use-toast';

const ChatSidebar = () => {
  const { chats, users, activeChat, setActiveChat, createChat, readMessages } = useChat();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'chats' | 'users' | 'add-people'>('chats');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    if (chat.type === 'direct') {
      return chat.participants.some(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return chat.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatClick = (chat: Chat) => {
    setActiveChat(chat);
    readMessages(chat.id);
  };

  const handleCreateDirectChat = (user: User) => {
    createChat([user]);
    setActiveTab('chats');
  };

  const handleCreateGroupChat = () => {
    if (selectedUsers.length > 0 && newGroupName) {
      createChat(selectedUsers, newGroupName);
      setSelectedUsers([]);
      setNewGroupName('');
      setActiveTab('chats');
    }
  };

  const toggleUserSelection = (user: User) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please provide a valid email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsInviting(true);
      
      // This would be a real API call in production
      // For now, we'll simulate the API call with a timeout
      setTimeout(() => {
        // Reset the input field and provide feedback
        setInviteEmail('');
        setIsInviting(false);
        
        toast({
          title: "Invitation Sent!",
          description: `We've sent an invite to ${inviteEmail}`,
        });
      }, 1500);
    } catch (error) {
      console.error('Failed to send invitation:', error);
      toast({
        title: "Failed to Send Invitation",
        description: "There was an error sending the invitation.",
        variant: "destructive"
      });
      setIsInviting(false);
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
            <h2 className="text-xl font-semibold mb-4">Invite People</h2>
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-center mb-4">
                Invite your friends or colleagues to join the conversation
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleInvite}
              className="w-full bg-chat-primary hover:bg-chat-accent"
              disabled={!inviteEmail || isInviting}
            >
              {isInviting ? "Sending Invite..." : "Send Invite"}
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
