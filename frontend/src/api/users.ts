import apiClient from './client';

export interface DashboardStats {
  totalOwes: number;
  totalOwed: number;
  totalBalance: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'EXPENSE' | 'SETTLEMENT';
  amount: number;
  netImpact: number;
  description: string;
  groupName: string;
  createdAt: string;
  actionText: string;
}

export const getDashboardStats = async () => {
  const response = await apiClient.get<{ status: string; data: DashboardStats }>('/users/dashboard');
  return response.data.data;
};
