export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginInput {
  email: string;
  password?: string; // Optional if we are typing it for frontend specifically, but backend requires it
}

export interface RegisterInput {
  name: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface Group {
  id: number;
  name: string;
  inviteCode: string;
  createdById: number;
  createdAt: string;
  members?: { user: User; role: string }[];
  pendingRequests?: { id: number; status: string; user: User }[];
}

export interface Expense {
  id: number;
  groupId: number;
  description: string;
  totalAmount: number;
  paidById: number;
  createdAt: string;
  paidBy?: User;
  participants?: { user: User; shareAmount: number }[];
}

export interface Settlement {
  id: number;
  groupId: number;
  payerId: number;
  payeeId: number;
  amount: number;
  status: string;
  createdAt: string;
  payer?: User;
  payee?: User;
}
