
import React, { useEffect, useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatConversation from './ChatConversation';
import UserProfile from './UserProfile';
import { useChat } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight } from 'lucide-react';

const ChatLayout = () => {
  const { isAuthenticated, currentUser, chats } = useChat();
  const [showSidebar, setShowSidebar] = useState(false);
  const { toast } = useToast();
  
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
  
  // New User Welcome Screen
  if (chats.length === 0 && !showSidebar) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <ArrowRight className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to Chat App!</h1>
          <p className="text-muted-foreground">
            Start chatting with your friends and colleagues. Build your network by inviting others to join.
          </p>
          <Button 
            size="lg" 
            className="mt-6"
            onClick={() => {
              setShowSidebar(true);
              toast({
                title: "Get Started",
                description: "Invite others to start chatting!"
              });
            }}
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
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
