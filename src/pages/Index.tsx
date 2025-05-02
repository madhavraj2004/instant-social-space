
import { ChatProvider } from '@/context/ChatContext';
import ChatLayout from '@/components/chat/ChatLayout';

const Index = () => {
  return (
    <div className="h-screen">
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </div>
  );
};

export default Index;
