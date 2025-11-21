import { User } from './user.type';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalChats: number;
  recentUsers: User[];
}
