import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Message as MessageType } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ChatConversation = () => {
  const { activeChat, currentUser, sendMessage } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current;
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [activeChat?.messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <h2 className="text-2xl font-semibold text-chat-primary mb-2">
            Welcome to Instant Social Space
          </h2>
          <p className="text-gray-500 mb-4">
            Select a chat or start a new conversation to begin messaging
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <MessageCircleIcon className="h-8 w-8 text-chat-primary mb-2" />
              <h3 className="font-medium">Direct Messages</h3>
              <p className="text-sm text-gray-500">Connect one-on-one with your contacts</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <UsersIcon className="h-8 w-8 text-chat-primary mb-2" />
              <h3 className="font-medium">Group Chats</h3>
              <p className="text-sm text-gray-500">Collaborate with multiple people at once</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <FileIcon className="h-8 w-8 text-chat-primary mb-2" />
              <h3 className="font-medium">File Sharing</h3>
              <p className="text-sm text-gray-500">Share images and documents easily</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <UserRoundIcon className="h-8 w-8 text-chat-primary mb-2" />
              <h3 className="font-medium">User Profiles</h3>
              <p className="text-sm text-gray-500">View status and information</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getChatName = () => {
    if (activeChat.type === 'group') return activeChat.name;
    const participant = activeChat.participants.find(p => p.id !== currentUser.id);
    return participant?.name;
  };

  const getChatParticipants = () => {
    if (activeChat.type === 'direct') return '';
    return `${activeChat.participants.length} participants`;
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(messageInput);
      setMessageInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // In a real app, you'd upload to a storage service
    // Here we'll use FileReader to get a data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileUrl = reader.result as string;
      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      
      sendMessage(`Sent a ${fileType}`, fileUrl, fileType as any);
      setIsUploading(false);
      
      toast({
        title: "File shared",
        description: `${file.name} has been shared`,
      });
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {activeChat.type === 'group' ? (
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c"
                alt={activeChat.name}
              />
            ) : (
              <img
                src={activeChat.participants.find(p => p.id !== currentUser.id)?.avatar}
                alt={getChatName()}
              />
            )}
          </Avatar>
          <div>
            <h2 className="font-semibold">{getChatName()}</h2>
            <p className="text-xs text-gray-500">{getChatParticipants()}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {activeChat.messages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUser.id}
              showAvatar={
                index === 0 ||
                activeChat.messages[index - 1].senderId !== message.senderId
              }
              senderName={
                activeChat.participants.find(p => p.id === message.senderId)?.name
              }
              formatMessageTime={formatMessageTime}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t bg-white">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip className="h-5 w-5 text-gray-500" />
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
          <div className="flex-1 relative">
            <Input
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
              disabled={isUploading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || isUploading}
            className="bg-chat-primary hover:bg-chat-accent"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface MessageProps {
  message: MessageType;
  isOwnMessage: boolean;
  showAvatar: boolean;
  senderName?: string;
  formatMessageTime: (timestamp: string) => string; // Added formatMessageTime as a prop
}

const Message = ({ message, isOwnMessage, showAvatar, senderName, formatMessageTime }: MessageProps) => {
  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} message-appear`}
    >
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} max-w-[80%]`}>
        {showAvatar && !isOwnMessage && (
          <Avatar className="h-8 w-8 mt-1 mx-2">
            <img 
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" 
              alt={senderName} 
            />
          </Avatar>
        )}
        <div>
          {showAvatar && !isOwnMessage && (
            <div className="text-xs text-gray-500 mb-1 ml-1">{senderName}</div>
          )}
          <div className="space-y-1">
            {message.fileUrl && message.fileType === 'image' && (
              <div className={`${isOwnMessage ? 'bg-chat-primary text-white' : 'bg-gray-100'} rounded-lg p-1`}>
                <img
                  src={message.fileUrl}
                  alt="Shared image"
                  className="max-h-60 rounded-lg object-contain"
                />
              </div>
            )}
            {(!message.fileUrl || message.fileType !== 'image') && (
              <div
                className={`px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-chat-primary text-white rounded-tr-none'
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            )}
            <div
              className={`text-xs text-gray-500 ${
                isOwnMessage ? 'text-right' : 'text-left'
              }`}
            >
              {formatMessageTime(message.timestamp)}
              {isOwnMessage && (
                <span className="ml-1">
                  {message.read ? '✓✓' : '✓'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Icons for the welcome screen
const MessageCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const FileIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const UserRoundIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
    <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
  </svg>
);

export default ChatConversation;
