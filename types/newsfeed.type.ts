import { User } from './user.type';

export interface Newsfeed {
  id: number;
  title: string;
  content: string;
  created_by: number;
  pinned?: boolean;
  published?: boolean;
  publishDate?: string;
  tags?: string;
  author?: User;
}
