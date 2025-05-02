
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatProvider, useChat } from '@/context/ChatContext';
import ChatLayout from '@/components/chat/ChatLayout';

// Wrapper component to check authentication
const ChatApp = () => {
  const { isAuthenticated } = useChat();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
