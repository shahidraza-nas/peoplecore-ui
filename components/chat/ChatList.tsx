'use client';

import { Chat, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { UserSearch } from './UserSearch';
import { useRef, useEffect } from 'react';

interface ChatListProps {
  chats: Chat[];
  activeChat: Chat | null;
  currentUser: User | null;
  loading: boolean;
  hasMoreChats: boolean;
  onlineUsers: Set<number>;
  onSelectChat: (chat: Chat) => void;
  onStartNewChat: (user: User) => void;
  onLoadMore: () => Promise<void>;
}

export function ChatList({ 
  chats, 
  activeChat, 
  currentUser, 
  loading, 
  hasMoreChats, 
  onlineUsers, 
  onSelectChat, 
  onStartNewChat,
  onLoadMore 
}: ChatListProps) {
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

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom && hasMoreChats && !loading) {
        onLoadMore();
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [hasMoreChats, loading, onLoadMore]);

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
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
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
                        <AvatarImage src={otherUser?.avatar || undefined} alt={otherUser?.name} />
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
                        <div className="flex items-center gap-2">
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(lastMessage.created_at), {
                                addSuffix: false,
                              })}
                            </span>
                          )}
                          {chat.unread_count !== undefined && chat.unread_count > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                              {chat.unread_count > 99 ? '99+' : chat.unread_count}
                            </span>
                          )}
                        </div>
                      </div>

                      {lastMessage && (
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn(
                            "text-sm line-clamp-1 flex-1",
                            chat.unread_count !== undefined && chat.unread_count > 0 
                              ? "font-semibold text-foreground" 
                              : "text-muted-foreground"
                          )}>
                            {lastMessage.fromUserId === currentUser?.id && 'You: '}
                            {lastMessage.message}
                          </p>
                        </div>
                      )}

                      {!lastMessage && (
                        <p className="text-sm text-muted-foreground italic">No messages yet</p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            
            {/* Loading indicator for pagination */}
            {/* {loading && chats.length > 0 && hasMoreChats && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading more chats...</span>
              </div>
            )} */}
            
            {/* End of list indicator */}
            {!hasMoreChats && chats.length > 0 && (
              <div className="py-3 text-center">
                <p className="text-xs text-muted-foreground">No more chats</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
