
import React from 'react';
import ChatSidebar from './ChatSidebar';
import ChatConversation from './ChatConversation';
import UserProfile from './UserProfile';

const ChatLayout = () => {
  return (
    <div className="h-screen flex overflow-hidden">
      <div className="flex flex-col w-80">
        <ChatSidebar />
        <UserProfile />
      </div>
      <ChatConversation />
    </div>
  );
};

export default ChatLayout;
