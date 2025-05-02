
import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRound, LogOut } from 'lucide-react';

const UserProfile = () => {
  const { currentUser } = useChat();
  const [status, setStatus] = useState(currentUser.status);

  const handleStatusChange = (value: string) => {
    setStatus(value as 'online' | 'offline' | 'away' | 'busy');
  };

  return (
    <div className="p-4 border-t">
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4 pb-4">
          <Avatar className="h-16 w-16">
            <img src={currentUser.avatar} alt={currentUser.name} />
          </Avatar>
          <div>
            <CardTitle className="text-lg">{currentUser.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className={`h-2 w-2 rounded-full mr-2 ${
                status === 'online' ? 'bg-green-500' : 
                status === 'away' ? 'bg-yellow-500' : 
                status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
              }`}></span>
              <span className="capitalize">{status}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="away">Away</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="offline">Appear Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator className="my-4" />
          <div className="flex space-x-2">
            <Button variant="outline" className="flex-1">
              <UserRound className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button variant="outline" className="flex-1">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
