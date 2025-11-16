
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/context/ChatContext';
import ChatLayout from '@/components/chat/ChatLayout';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated, currentUser, chats, isLoading } = useChat();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login');
      } else if (isAuthenticated && currentUser) {
        toast({
          title: `Welcome, ${currentUser.name}!`,
          description: `You have ${chats.length} conversations`
        });
      }
    }
  }, [isAuthenticated, isLoading, navigate, currentUser, chats, toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen">
      <ChatLayout />
    </div>
  );
};

export default Index;
