import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Message as MessageType } from '@/types';
import { Download, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Message = ({
  message,
  isOwnMessage,
  showAvatar,
  senderName,
  formatMessageTime,
}: {
  message: MessageType;
  isOwnMessage: boolean;
  showAvatar: boolean;
  senderName: string;
  formatMessageTime: (timestamp: string) => string;
}) => {
  const handleDownload = () => {
    if (message.fileUrl) {
      window.open(message.fileUrl, '_blank');
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 ${
        isOwnMessage ? 'justify-end' : ''
      }`}
    >
      {!isOwnMessage && showAvatar && (
        <Avatar className="h-8 w-8">
          <img
            src={message.senderAvatar || 'https://via.placeholder.com/150'}
            alt={senderName}
          />
        </Avatar>
      )}
      <div
        className={`flex flex-col ${
          isOwnMessage ? 'items-end' : 'items-start'
        }`}
      >
        {!isOwnMessage && <span className="text-xs text-muted-foreground mb-1">{senderName}</span>}
        <div
          className={`p-3 rounded-lg max-w-md ${
            isOwnMessage
              ? 'bg-chat-primary text-white'
              : 'bg-muted text-foreground'
          }`}
        >
          {message.type === 'text' && <p className="break-words">{message.content}</p>}
          
          {message.type === 'image' && message.fileUrl && (
            <div className="space-y-2">
              <img
                src={message.fileUrl}
                alt="Shared content"
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleDownload}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className={`w-full ${isOwnMessage ? 'text-white hover:text-white/90' : ''}`}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          )}
          
          {message.type === 'document' && message.fileUrl && (
            <div className="flex items-center space-x-3 min-w-[200px]">
              <FileText className="h-8 w-8" />
              <div className="flex-1">
                <p className="text-sm font-medium">Document</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className={`p-0 h-auto ${isOwnMessage ? 'text-white hover:text-white/90' : ''}`}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          )}
          
          {message.type === 'video' && message.fileUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-center bg-black/10 rounded-lg p-4">
                <Video className="h-12 w-12" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className={`w-full ${isOwnMessage ? 'text-white hover:text-white/90' : ''}`}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Video
              </Button>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {formatMessageTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default Message;