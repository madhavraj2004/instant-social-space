
import React from 'react';
import { User } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UserItemProps {
  user: User;
  onClick?: () => void;
  isSelected?: boolean;
}

const UserItem = ({ user, onClick, isSelected }: UserItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-muted-foreground/50';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-muted-foreground/50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Active now';
      case 'away':
        return 'Away';
      case 'busy':
        return 'Busy';
      default:
        return 'Offline';
    }
  };

  return (
    <div
      className={`p-2 rounded-md flex items-center space-x-3 cursor-pointer hover:bg-accent transition-colors ${
        isSelected ? 'bg-accent' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <img src={user.avatar} alt={user.name} className="object-cover" />
        </Avatar>
        <span 
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background 
            ${getStatusColor(user.status)} ${user.status === 'online' ? 'animate-pulse' : ''}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <h3 className="font-medium text-foreground truncate">{user.name}</h3>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <span className={user.status === 'online' ? 'text-green-500 font-medium' : ''}>
            {getStatusText(user.status)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserItem;
