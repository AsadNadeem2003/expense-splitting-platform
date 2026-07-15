import apiClient from './client';
import type { Expense } from '../types';

export const createExpense = async (data: any) => {
  const response = await apiClient.post<{ status: string; data: Expense }>('/expenses', data);
  return response.data.data;
};

export const getGroupExpenses = async (groupId: number) => {
  const response = await apiClient.get<{ status: string; data: Expense[] }>(`/expenses/group/${groupId}`);
  return response.data.data;
};

export const getExpenseDetails = async (expenseId: number) => {
  const response = await apiClient.get<{ status: string; data: Expense }>(`/expenses/${expenseId}`);
  return response.data.data;
};

export const updateExpense = async (expenseId: number, data: any) => {
  const response = await apiClient.patch<{ status: string; data: Expense }>(`/expenses/${expenseId}`, data);
  return response.data.data;
};
