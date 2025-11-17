'use client';

import { ChatMessage, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: ChatMessage;
  currentUser: User | null;
  isConsecutive?: boolean;
}

export function MessageBubble({ message, currentUser, isConsecutive = false }: MessageBubbleProps) {
  const isSent = Number(message.fromUserId) === Number(currentUser?.id);

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
          'group relative max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm',
          isSent
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>

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
