import { User } from './user.type';

export interface Newsfeed {
  id: number;
  title: string;
  content: string;
  authorId: number;
  pinned?: boolean;
  published?: boolean;
  publishDate?: string;
  tags?: string;
  author?: User;
}
