import apiClient from './client';

export interface DashboardStats {
  totalOwes: number;
  totalOwed: number;
  totalBalance: number;
  recentActivity: any[];
  balancesBreakdown: any[];
  remindersReceived?: {
    id: number;
    groupId: number;
    debtorId: number;
    creditorId: number;
    amount: number;
    sentAt: string;
    group: { id: number; name: string };
    creditor: { id: number; name: string };
  }[];
  pendingVerifications?: {
    id: number;
    groupId: number;
    payerId: number;
    payeeId: number;
    amount: number;
    screenshotUrl?: string;
    status: string;
    createdAt: string;
    group: { id: number; name: string };
    payer: { id: number; name: string };
  }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get('/users/dashboard');
  return response.data.data;
};

export const searchUsers = async (query: string) => {
  const response = await apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data.data;
};

export const getActivityFeed = async (limit: number = 50) => {
  const response = await apiClient.get(`/users/activity?limit=${limit}`);
  return response.data.data;
};

export const updateProfile = async (data: { name?: string; defaultCurrency?: string; paymentMethod?: string }) => {
  const response = await apiClient.put('/users/profile', data);
  return response.data.data;
};
