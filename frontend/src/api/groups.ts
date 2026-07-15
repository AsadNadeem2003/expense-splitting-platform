import apiClient from './client';
import type { Group } from '../types';

export const createGroup = async (name: string) => {
  const response = await apiClient.post<{ status: string; data: Group }>('/groups', { name });
  return response.data.data;
};

export const joinGroup = async (inviteCode: string) => {
  const response = await apiClient.post('/groups/join', { inviteCode });
  return response.data.data;
};

export const getUserGroups = async () => {
  const response = await apiClient.get<{ status: string; data: Group[] }>('/groups/my');
  return response.data.data;
};

export const getGroupDetails = async (groupId: number) => {
  const response = await apiClient.get<{ status: string; data: Group }>(`/groups/${groupId}`);
  return response.data.data;
};

export const getGroupBalances = async (groupId: number) => {
  const response = await apiClient.get(`/groups/${groupId}/balances`);
  return response.data.data;
};

export const approveJoinRequest = async (groupId: number, requestId: number) => {
  const response = await apiClient.post(`/groups/${groupId}/approve/${requestId}`);
  return response.data;
};

export const rejectJoinRequest = async (groupId: number, requestId: number) => {
  const response = await apiClient.post(`/groups/${groupId}/reject/${requestId}`);
  return response.data;
};

export const inviteUser = async (groupId: number, email: string) => {
  const response = await apiClient.post(`/groups/${groupId}/invite`, { email });
  return response.data;
};

export const removeMember = async (groupId: number, userId: number) => {
  const response = await apiClient.delete(`/groups/${groupId}/members/${userId}`);
  return response.data;
};

export const leaveGroup = async (groupId: number) => {
  const response = await apiClient.delete(`/groups/${groupId}/leave`);
  return response.data;
};
