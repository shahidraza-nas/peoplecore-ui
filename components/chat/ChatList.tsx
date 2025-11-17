'use client';

import { Chat, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { UserSearch } from './UserSearch';

interface ChatListProps {
  chats: Chat[];
  activeChat: Chat | null;
  currentUser: User | null;
  loading: boolean;
  onlineUsers: Set<number>;
  onSelectChat: (chat: Chat) => void;
  onStartNewChat: (user: User) => void;
}

export function ChatList({ chats, activeChat, currentUser, loading, onlineUsers, onSelectChat, onStartNewChat }: ChatListProps) {
  const getOtherUser = (chat: Chat): User | undefined => {
    if (!currentUser || !chat.user1 || !chat.user2) return undefined;
    return Number(chat.user1.id) === Number(currentUser.id) ? chat.user2 : chat.user1;
  };

  const getLastMessage = (chat: Chat) => {
    return chat.messages?.[0];
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-3">
        <UserSearch currentUser={currentUser} onSelectUser={onStartNewChat} />
      </div>

      {loading && chats.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && chats.length === 0 && (
        <div className="flex flex-1 items-center justify-center p-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use the search above to start a conversation
            </p>
          </div>
        </div>
      )}

      {chats.length > 0 && (
        <ScrollArea className="flex-1">
          <div className="py-1">
            {chats.map((chat) => {
              const otherUser = getOtherUser(chat);
              const lastMessage = getLastMessage(chat);
              const isActive = activeChat?.uid === chat.uid;

              return (
                <button
                  key={chat.uid}
                  onClick={() => onSelectChat(chat)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent',
                    isActive && 'bg-accent'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherUser?.avatar} alt={otherUser?.name} />
                        <AvatarFallback>{getInitials(otherUser?.name)}</AvatarFallback>
                      </Avatar>
                      {otherUser && (
                        <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                          onlineUsers.has(Number(otherUser.id)) ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      )}
                    </div>

                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {otherUser?.name || 'Unknown User'}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(lastMessage.created_at), {
                              addSuffix: false,
                            })}
                          </span>
                        )}
                      </div>

                      {lastMessage && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {lastMessage.fromUserId === currentUser?.id && 'You: '}
                          {lastMessage.message}
                        </p>
                      )}

                      {!lastMessage && (
                        <p className="text-sm text-muted-foreground italic">No messages yet</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
