
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatProvider, useChat } from '@/context/ChatContext';
import ChatLayout from '@/components/chat/ChatLayout';
import { useToast } from '@/hooks/use-toast';

// Wrapper component to check authentication
const ChatApp = () => {
  const { isAuthenticated, currentUser, chats } = useChat();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated && currentUser) {
      // User is logged in, welcome them
      toast({
        title: `Welcome, ${currentUser.name}!`,
        description: `You have ${chats.length} conversations`
      });
    }
  }, [isAuthenticated, navigate, currentUser, chats.length, toast]);

  if (!isAuthenticated) return null;

  return <ChatLayout />;
};

const Index = () => {
  return (
    <div className="h-screen">
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </div>
  );
};

export default Index;
