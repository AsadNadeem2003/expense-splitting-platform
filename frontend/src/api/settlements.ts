import apiClient from './client';
import type { Settlement } from '../types';

export const createSettlement = async (data: FormData) => {
  const response = await apiClient.post<{ status: string; data: Settlement }>('/settlements', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const getGroupSettlements = async (groupId: number) => {
  const response = await apiClient.get<{ status: string; data: Settlement[] }>(`/settlements/group/${groupId}`);
  return response.data.data;
};

export const confirmSettlement = async (settlementId: number) => {
  const response = await apiClient.post<{ status: string; data: Settlement }>(`/settlements/${settlementId}/confirm`);
  return response.data.data;
};

export const rejectSettlement = async (settlementId: number) => {
  const response = await apiClient.post<{ status: string; data: Settlement }>(`/settlements/${settlementId}/reject`);
  return response.data.data;
};
