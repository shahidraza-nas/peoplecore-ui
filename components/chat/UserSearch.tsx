'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, X } from 'lucide-react';
import { searchUsers as searchUsersAction } from '@/actions/user.action';


interface UserSearchProps {
  currentUser: User | null;
  onSelectUser: (user: User) => void;
}

export function UserSearch({ currentUser, onSelectUser }: UserSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setUsers([]);
      setLoading(false);
      return;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const response = await searchUsersAction(query);

      if (!response.success || response.error) {
        console.error('Error searching users:', response.error);
        setUsers([]);
        return;
      }

      const foundUsers = response.data?.users || [];
      // Filter out current user
      const filteredUsers = foundUsers.filter((u: User) => u.id !== currentUser?.id);
      setUsers(filteredUsers);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error searching users:', error);
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(search);
    }, 500); // Increased debounce to 500ms

    return () => {
      clearTimeout(timer);
    };
  }, [search, performSearch]);

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    setIsOpen(false);
    setSearch('');
    setUsers([]);
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
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search users to start a chat"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-9 h-10"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setUsers([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (search.length >= 2 || loading) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md">
          <ScrollArea className="max-h-[300px]">
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            {!loading && users.length === 0 && search.length >= 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No users found
              </div>
            )}

            {!loading && users.length > 0 && (
              <div className="p-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="flex w-full items-center gap-3 rounded-sm p-2 text-left hover:bg-accent transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
