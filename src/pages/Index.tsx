
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/context/ChatContext';
import ChatLayout from '@/components/chat/ChatLayout';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { isAuthenticated, currentUser, chats } = useChat();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("Index - Auth state:", isAuthenticated, "User:", currentUser);
    
    if (!isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated && currentUser) {
      toast({
        title: `Welcome, ${currentUser.name}!`,
        description: `You have ${chats.length} conversations`
      });
    }
  }, [isAuthenticated, navigate, currentUser, chats, toast]);

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen">
      <ChatLayout />
    </div>
  );
};

export default Index;
