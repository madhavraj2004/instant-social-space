import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserSearchProps {
  onChatCreated: (chatId: string) => void;
}

const UserSearch = ({ onChatCreated }: UserSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`display_name.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Filter out current user
      const { data: { user } } = await supabase.auth.getUser();
      const filteredResults = data?.filter(profile => profile.id !== user?.id) || [];
      
      setSearchResults(filteredResults);
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: 'Error',
        description: 'Failed to search users',
        variant: 'destructive'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateChat = async (participantId: string) => {
    setIsCreatingChat(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('create-chat', {
        body: { participant_id: participantId, type: 'direct' }
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: data.exists ? 'Chat opened' : 'New chat created'
      });

      onChatCreated(data.chat_id);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error: any) {
      console.error('Create chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to create chat',
        variant: 'destructive'
      });
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div className="p-4 border-b">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <ScrollArea className="h-64 mt-4">
          <div className="space-y-2">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.display_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.display_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.status}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleCreateChat(user.id)}
                  disabled={isCreatingChat}
                >
                  {isCreatingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Chat'}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default UserSearch;