
import React, { useEffect } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatConversation from './ChatConversation';
import UserProfile from './UserProfile';
import { useChat } from '@/context/ChatContext';

const ChatLayout = () => {
  const { isAuthenticated, currentUser } = useChat();
  
  // Add extra logging for debugging
  useEffect(() => {
    console.log("ChatLayout mounted, auth status:", isAuthenticated);
    console.log("Current user in ChatLayout:", currentUser);
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    console.log("Not authenticated in ChatLayout, should not render");
    return null;
  }

  console.log("Rendering ChatLayout for authenticated user");
  
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
