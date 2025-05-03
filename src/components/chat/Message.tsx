import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Message as MessageType } from '@/types';

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
        {!isOwnMessage && <span className="text-xs text-gray-500">{senderName}</span>}
        <div
          className={`p-2 rounded-lg ${
            isOwnMessage
              ? 'bg-chat-primary text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {message.type === 'text' && <p>{message.content}</p>}
          {message.type === 'image' && (
            <img
              src={message.content}
              alt="Shared content"
              className="max-w-xs rounded-lg"
            />
          )}
          {message.type === 'document' && (
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              View Document
            </a>
          )}
        </div>
        <span className="text-xs text-gray-400 mt-1">
          {formatMessageTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default Message;