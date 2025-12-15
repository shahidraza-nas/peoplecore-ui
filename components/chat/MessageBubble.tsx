'use client';

import { Chat, ChatMessage, User } from '@/types';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useSocketContext } from '@/contexts/socket';

interface MessageBubbleProps {
  message: ChatMessage;
  currentUser: User | null;
  isConsecutive?: boolean;
  activeChat: Chat | null;
}

export function MessageBubble({ message, currentUser, isConsecutive = false, activeChat }: MessageBubbleProps) {
  const { socket } = useSocketContext();
  const [showEmojis, setShowEmojis] = useState(false);
  const isSent = Number(message.fromUserId) === Number(currentUser?.id);

  const reactions = message.reactions || {};
  const availableEmojis = ['❤️', '😂', '😮', '😢', '👍', '👎'];

  // Calculate total reactions and user's reactions
  const totalReactions = Object.values(reactions).reduce((sum, users) => sum + users.length, 0);
  const userReactions = availableEmojis.filter(emoji => reactions[emoji]?.includes(Number(currentUser?.id)));
  const hasUserReacted = userReactions.length > 0;

  const handleReaction = (emoji: string) => {
    if (!socket || !activeChat) return;

    const hasReactedWithThisEmoji = reactions[emoji]?.includes(Number(currentUser?.id)) || false;

    if (hasReactedWithThisEmoji) {
      // Remove this reaction
      socket.emit('user.reaction', {
        action: 'remove',
        messageUid: message.uid,
        emoji,
        chatUid: activeChat.uid,
      });
    } else {
      const existingReaction = userReactions[0];
      if (existingReaction) {
        socket.emit('user.reaction', {
          action: 'remove',
          messageUid: message.uid,
          emoji: existingReaction,
          chatUid: activeChat.uid,
        });
      }
      socket.emit('user.reaction', {
        action: 'add',
        messageUid: message.uid,
        emoji,
        chatUid: activeChat.uid,
      });
    }
  };

  return (
    <div
      className={cn(
        'flex w-full',
        isSent ? 'justify-end' : 'justify-start',
        isConsecutive ? 'mt-1' : 'mt-4'
      )}
    >
      <div
        className={cn(
          'group relative max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm transition-colors',
          isSent
            ? hasUserReacted
              ? 'bg-blue-100 text-primary-foreground rounded-br-md'
              : 'bg-primary text-primary-foreground rounded-br-md'
            : hasUserReacted
            ? 'bg-blue-50 dark:bg-blue-950 text-foreground rounded-bl-md'
            : 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-bl-md'
        )}
        onMouseEnter={() => setShowEmojis(true)}
        onMouseLeave={() => setShowEmojis(false)}
      >
        <p className="text-sm whitespace-pre-wrap wrap-break-word leading-relaxed">{message.message}</p>

        {/* Floating Emoji Reactions */}
        <div
          className={cn(
            'absolute -top-3 flex items-center gap-1 z-10 transition-all duration-300',
            isSent ? '-left-2' : '-right-2'
          )}
        >
          {showEmojis ? (
            // Show all available emojis on hover
            availableEmojis.map((emoji) => {
              const count = reactions[emoji]?.length || 0;
              const hasUserReacted = reactions[emoji]?.includes(Number(currentUser?.id)) || false;

              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full text-sm transition-all duration-200 ease-out shadow-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95',
                    hasUserReacted
                      ? 'bg-linear-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700 scale-110'
                      : count > 0
                      ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:shadow-xl hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500'
                      : 'bg-gray-100/80 text-gray-600 border-gray-200/50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-blue-200/50 dark:bg-gray-700/80 dark:text-gray-400 dark:border-gray-600/50 dark:hover:bg-blue-950/50 dark:hover:text-blue-400 dark:hover:border-blue-500/50'
                  )}
                  aria-label={`${count > 0 ? `${count} ` : ''}${emoji} reactions`}
                  title={`${count > 0 ? `${count} ` : ''}React with ${emoji}`}
                >
                  <span className="text-lg leading-none">{emoji}</span>
                </button>
              );
            })
          ) : totalReactions > 0 ? (
            // Show existing reactions when not hovering
            availableEmojis
              .filter(emoji => (reactions[emoji]?.length || 0) > 0)
              .slice(0, 3) // Show max 3 reactions to avoid crowding
              .map((emoji) => {
                const count = reactions[emoji]?.length || 0;
                const hasUserReacted = reactions[emoji]?.includes(Number(currentUser?.id)) || false;

                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    className={cn(
                      'flex items-center justify-center w-6 h-6 rounded-full text-sm transition-all duration-200 ease-out shadow-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 active:scale-95',
                      hasUserReacted
                        ? 'bg-linear-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-600 hover:to-blue-700 scale-110'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:shadow-xl hover:border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500'
                    )}
                    aria-label={`${count} ${emoji} reactions`}
                    title={`${count} React with ${emoji}`}
                  >
                    <span className="text-lg leading-none">{emoji}</span>
                  </button>
                );
              })
          ) : null}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            'mt-1 flex items-center justify-end gap-1 text-xs',
            isSent ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
          )}
        >
          <span>
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: false })}
          </span>

          {isSent && (
            <span className="ml-1">
              {message.isRead ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
