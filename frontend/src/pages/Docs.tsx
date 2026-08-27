import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Cpu, Database, GitBranch, Terminal, 
  ArrowLeft, Search, Check, Copy, Sparkles, Server, 
  Layers, Lock, Play, Plus, Trash2, Globe, 
  HelpCircle, Code2, Users, Receipt, CreditCard, Bell, 
  Zap, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Docs.css';

interface DemoMember {
  id: string;
  name: string;
  paid: number;
  share: number;
}

interface SimplifiedTransfer {
  from: string;
  to: string;
  amount: number;
}

export default function Docs() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('quickstart');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- Interactive Debt Simplification Playground State ---
  const [members, setMembers] = useState<DemoMember[]>([
    { id: '1', name: 'Ali (Payer 1)', paid: 6000, share: 2000 },
    { id: '2', name: 'Zain (Payer 2)', paid: 2000, share: 2000 },
    { id: '3', name: 'Hassan', paid: 0, share: 2000 },
    { id: '4', name: 'Nouman', paid: 0, share: 2000 },
  ]);
  const [simplifiedTransfers, setSimplifiedTransfers] = useState<SimplifiedTransfer[]>([]);
  const [newName, setNewName] = useState('');
  const [newPaid, setNewPaid] = useState<number | ''>('');
  const [newShare, setNewShare] = useState<number | ''>('');

  // Active API category filter
  const [apiCategory, setApiCategory] = useState<'all' | 'auth' | 'groups' | 'expenses' | 'settlements' | 'users'>('all');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run the Greedy Debt Simplification Algorithm locally in the playground
  const runSimplificationAlgorithm = () => {
    // 1. Calculate net balance for each member: B_i = Paid_i - Share_i
    const balances = members.map(m => ({
      name: m.name,
      balance: m.paid - m.share
    }));

    // 2. Separate into debtors (B_i < 0) and creditors (B_i > 0)
    const debtors = balances
      .filter(b => b.balance < 0)
      .map(b => ({ name: b.name, balance: b.balance }))
      .sort((a, b) => a.balance - b.balance); // Ascending (most negative first)

    const creditors = balances
      .filter(b => b.balance > 0)
      .map(b => ({ name: b.name, balance: b.balance }))
      .sort((a, b) => b.balance - a.balance); // Descending (largest positive first)

    const transfers: SimplifiedTransfer[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];

      const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
      if (amount > 0) {
        transfers.push({
          from: debtor.name,
          to: creditor.name,
          amount: Math.round(amount * 100) / 100
        });
      }

      debtor.balance += amount;
      creditor.balance -= amount;

      if (Math.abs(debtor.balance) < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    setSimplifiedTransfers(transfers);
  };

  // Run on initial mount or when members change
  useEffect(() => {
    runSimplificationAlgorithm();
  }, [members]);

  const addMember = () => {
    if (!newName.trim()) return;
    const paidVal = typeof newPaid === 'number' ? newPaid : 0;
    const shareVal = typeof newShare === 'number' ? newShare : 0;
    setMembers([...members, { id: Date.now().toString(), name: newName.trim(), paid: paidVal, share: shareVal }]);
    setNewName('');
    setNewPaid('');
    setNewShare('');
  };

  const removeMember = (id: string) => {
    if (members.length <= 2) {
      toast.error('Simulation requires at least 2 members');
      return;
    }
    setMembers(members.filter(m => m.id !== id));
  };

  // 10 Comprehensive Documentation Sections
  const sections = [
    { id: 'quickstart', title: '1. User Quickstart & Guide', icon: Zap, category: 'User Guide' },
    { id: 'components', title: '2. Component Architecture & API Mapping', icon: Code2, category: 'Architecture' },
    { id: 'overview', title: '3. System Topology & Tech Stack', icon: Layers, category: 'Architecture' },
    { id: 'algorithm', title: '4. Debt Simplification Engine', icon: Cpu, category: 'Mathematics' },
    { id: 'precision', title: '5. Zero Floating-Point Paisa Math', icon: Shield, category: 'Mathematics' },
    { id: 'database', title: '6. Database Schema & Indexes', icon: Database, category: 'Data Layer' },
    { id: 'workflows', title: '7. Core Sequence Workflows', icon: GitBranch, category: 'Logic' },
    { id: 'security', title: '8. Security & Rate Limiting', icon: Lock, category: 'Security' },
    { id: 'api', title: '9. Exhaustive REST API Reference', icon: Terminal, category: 'Endpoints' },
    { id: 'devops', title: '10. AWS EC2 & CI/CD Deployment', icon: Server, category: 'DevOps' },
    { id: 'faqs', title: '11. Client & Developer FAQs', icon: HelpCircle, category: 'Reference' },
  ];

  // Component-by-Component Mapping Catalog
  const frontendComponents = [
    {
      name: 'Dashboard (pages/Dashboard.tsx)',
      icon: Layers,
      role: 'Main user financial overview landing page',
      description: 'Displays user net balance summary (Total You Owe, Total You Are Owed), breakdown breakdown trigger modal, quick onboarding guide, and list of active expense groups.',
      apis: [
        { endpoint: 'GET /api/users/dashboard', purpose: 'Fetches total owed, total owes, and pending join request count' },
        { endpoint: 'GET /api/groups/my', purpose: 'Fetches list of user groups with member avatars and balances' }
      ]
    },
    {
      name: 'Groups List (pages/GroupsList.tsx)',
      icon: Users,
      role: 'Group discovery, creation, and join portal',
      description: 'Displays a card grid of all joined groups, total net balance per group, modal for creating groups, and modal for joining via 6-character invite codes with admin approval.',
      apis: [
        { endpoint: 'GET /api/groups/my', purpose: 'Retrieves all user group memberships and roles' },
        { endpoint: 'POST /api/groups', purpose: 'Creates a new group with a unique invite code' },
        { endpoint: 'POST /api/groups/join', purpose: 'Submits a join request using group invite code' }
      ]
    },
    {
      name: 'Group Details (pages/GroupDetails.tsx)',
      icon: Receipt,
      role: 'Multi-tab group workspace (Expenses, Balances, Settlements, Members)',
      description: 'Central hub for a specific group. Handles tab deep-linking (?tab=members), displays expense feeds, computes debt simplification graphs, manages join requests, and generates WhatsApp invite links.',
      apis: [
        { endpoint: 'GET /api/groups/:id', purpose: 'Loads group name, members, and creator role' },
        { endpoint: 'GET /api/groups/:id/balances', purpose: 'Computes simplified net balances and greedy settlement transfers' },
        { endpoint: 'GET /api/expenses/group/:id', purpose: 'Fetches chronological list of group expenses' },
        { endpoint: 'GET /api/settlements/group/:id', purpose: 'Fetches confirmed and pending settlement transactions' },
        { endpoint: 'POST /api/groups/:id/approve/:requestId', purpose: 'Admin approves pending member join request' },
        { endpoint: 'POST /api/groups/:id/reject/:requestId', purpose: 'Admin rejects pending member join request' },
        { endpoint: 'POST /api/groups/:id/invite', purpose: 'Directly adds member by email/name search' },
        { endpoint: 'DELETE /api/groups/:id', purpose: 'Cascades atomic deletion of group and all related expenses' }
      ]
    },
    {
      name: 'Add Expense Modals (components/expenses/AddExpenseModal.tsx & GlobalAddExpenseModal.tsx)',
      icon: Plus,
      role: 'Multi-payer expense creation & share allocation',
      description: 'Allows recording expenses with single or multiple payers, equal or unequal participant share splits, and input validation ensuring total paid equals total split.',
      apis: [
        { endpoint: 'POST /api/expenses', purpose: 'Creates expense record, payer shares, and participant allocations inside an ACID transaction' }
      ]
    },
    {
      name: 'Settle-Up Module (components/settlements/SettleUpModal.tsx)',
      icon: CreditCard,
      role: 'Debt repayment with screenshot proof and payee account auto-fill',
      description: 'Enables a debtor to select a creditor, automatically displays their configured payment account (EasyPaisa, JazzCash, Raast, Nayapay, Sadapay, Bank IBAN), and uploads payment receipt screenshots.',
      apis: [
        { endpoint: 'POST /api/settlements', purpose: 'Uploads screenshot via Multer and creates settlement with AWAITING_VERIFICATION status' }
      ]
    },
    {
      name: 'Notification Popover (components/layout/NotificationsPopover.tsx)',
      icon: Bell,
      role: 'Real-time alert center with 1-click inline actions',
      description: 'Polls every 15 seconds. Displays debtor reminder alerts, settlement proof verification links, and incoming group join requests with 1-click Approve (✓) and Reject (✕) buttons.',
      apis: [
        { endpoint: 'GET /api/users/dashboard', purpose: 'Polls unread reminder counts and pending join requests' },
        { endpoint: 'POST /api/groups/:id/approve/:requestId', purpose: '1-click approval directly from navbar popover' },
        { endpoint: 'POST /api/settlements/:id/confirm', purpose: 'Payee confirms receipt of funds in 1 click' }
      ]
    },
    {
      name: 'Activity Feed (pages/Activity.tsx)',
      icon: GitBranch,
      role: 'Financial audit trail & transaction history',
      description: 'Provides complete immutable chronological activity feed of all expenses, edits, and confirmed settlements with real-time category filtering (All, Expenses, Settlements).',
      apis: [
        { endpoint: 'GET /api/users/activity', purpose: 'Fetches combined chronological stream of expenses and settlements' }
      ]
    },
    {
      name: 'Settings & Payment Methods (pages/Settings.tsx)',
      icon: Shield,
      role: 'User profile & payment receiving configuration',
      description: 'Allows users to configure structured receiving accounts (EasyPaisa, JazzCash, Raast ID, Nayapay, Sadapay, Bank IBAN) displayed to debtors when settling up.',
      apis: [
        { endpoint: 'GET /api/users/me', purpose: 'Loads user name, email, and configured payment receiving account' },
        { endpoint: 'PUT /api/users/profile', purpose: 'Updates name, password, default currency, and payment details' }
      ]
    }
  ];

  // Complete Exhaustive 22-Endpoint REST API Catalog
  const allApiEndpoints = [
    // Auth Endpoints
    {
      method: 'POST',
      category: 'auth',
      path: '/api/auth/register',
      auth: 'Public',
      summary: 'Register New User Account',
      desc: 'Creates a new user with salted bcrypt password hashing (cost factor 10) and issues a 1-hour access token + 7-day httpOnly refresh cookie.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Ali Khan", "email": "ali@example.com", "password": "Password123!"}'`,
      body: '{\n  "name": "Ali Khan",\n  "email": "ali@example.com",\n  "password": "Password123!"\n}',
      response: '{\n  "message": "User registered successfully",\n  "accessToken": "eyJhbGciOiJIUzI1Ni...",\n  "user": { "id": 1, "name": "Ali Khan", "email": "ali@example.com" }\n}'
    },
    {
      method: 'POST',
      category: 'auth',
      path: '/api/auth/login',
      auth: 'Public (Rate Limited: 50 req/15min)',
      summary: 'Authenticate User & Issue Tokens',
      desc: 'Validates email and password, checks rate limiting, and returns a stateless 1-hour JWT while setting an httpOnly SameSite refresh cookie.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "ali@example.com", "password": "Password123!"}'`,
      body: '{\n  "email": "ali@example.com",\n  "password": "Password123!"\n}',
      response: '{\n  "accessToken": "eyJhbGciOiJIUzI1Ni...",\n  "user": { "id": 1, "name": "Ali Khan", "email": "ali@example.com" }\n}'
    },
    {
      method: 'POST',
      category: 'auth',
      path: '/api/auth/refresh',
      auth: 'httpOnly Cookie',
      summary: 'Silent Refresh Token Rotation',
      desc: 'Reads the long-lived httpOnly refresh cookie and issues a fresh 1-hour access token when the current token expires.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/auth/refresh \\
  -H "Cookie: refreshToken=eyJhbGciOi..."`,
      body: '{}',
      response: '{\n  "accessToken": "eyJhbGciOiJIUzI1Ni..."\n}'
    },
    {
      method: 'POST',
      category: 'auth',
      path: '/api/auth/logout',
      auth: 'Bearer JWT',
      summary: 'Server Logout & Cookie Invalidation',
      desc: 'Clears the secure httpOnly refresh cookie from the browser and terminates the active session.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/auth/logout \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: '{}',
      response: '{\n  "message": "Logged out successfully"\n}'
    },

    // Group Endpoints
    {
      method: 'POST',
      category: 'groups',
      path: '/api/groups',
      auth: 'Bearer JWT',
      summary: 'Create Expense Group',
      desc: 'Creates a new group, generates a unique 6-character alphanumeric invite code (e.g. PUH19), and assigns creator as ADMIN.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/groups \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "PU Hostel 19"}'`,
      body: '{\n  "name": "PU Hostel 19"\n}',
      response: '{\n  "id": 1,\n  "name": "PU Hostel 19",\n  "inviteCode": "PUH19",\n  "createdById": 1,\n  "role": "ADMIN"\n}'
    },
    {
      method: 'GET',
      category: 'groups',
      path: '/api/groups/my',
      auth: 'Bearer JWT',
      summary: 'List User Groups',
      desc: 'Returns all groups where the authenticated user is an active member or admin.',
      curl: `curl -X GET https://98.92.49.144.sslip.io/api/groups/my \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None',
      response: '[\n  {\n    "id": 1,\n    "name": "PU Hostel 19",\n    "inviteCode": "PUH19",\n    "membersCount": 4,\n    "role": "ADMIN"\n  }\n]'
    },
    {
      method: 'GET',
      category: 'groups',
      path: '/api/groups/:groupId',
      auth: 'Bearer JWT (Group Member)',
      summary: 'Get Group Details & Member Roster',
      desc: 'Returns full group details, list of members with roles, joined dates, and pending join requests (if caller is ADMIN).',
      curl: `curl -X GET https://98.92.49.144.sslip.io/api/groups/1 \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Param: groupId)',
      response: '{\n  "id": 1,\n  "name": "PU Hostel 19",\n  "inviteCode": "PUH19",\n  "members": [\n    { "id": 1, "userId": 1, "name": "Ali", "role": "ADMIN" },\n    { "id": 2, "userId": 2, "name": "Zain", "role": "MEMBER" }\n  ]\n}'
    },
    {
      method: 'GET',
      category: 'groups',
      path: '/api/groups/:groupId/balances',
      auth: 'Bearer JWT (Group Member)',
      summary: 'Compute Group Balances & Simplified Debt Graph',
      desc: 'Computes net balances for all members and runs the greedy debt simplification algorithm to return minimal required settlement transfers.',
      curl: `curl -X GET https://98.92.49.144.sslip.io/api/groups/1/balances \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Param: groupId)',
      response: '{\n  "netBalances": [\n    { "userId": 1, "userName": "Ali", "balance": 400000 },\n    { "userId": 2, "userName": "Zain", "balance": -200000 },\n    { "userId": 3, "userName": "Hassan", "balance": -200000 }\n  ],\n  "simplifiedDebts": [\n    { "from": 2, "fromName": "Zain", "to": 1, "toName": "Ali", "amount": 200000 },\n    { "from": 3, "fromName": "Hassan", "to": 1, "toName": "Ali", "amount": 200000 }\n  ]\n}'
    },
    {
      method: 'POST',
      category: 'groups',
      path: '/api/groups/join',
      auth: 'Bearer JWT (Rate Limited: 20 req/15min)',
      summary: 'Request to Join Group via Invite Code',
      desc: 'Submits a join request. Validates active membership, prevents duplicate requests, and alerts group admins in real-time.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/groups/join \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"inviteCode": "PUH19"}'`,
      body: '{\n  "inviteCode": "PUH19"\n}',
      response: '{\n  "id": 10,\n  "groupId": 1,\n  "userId": 3,\n  "status": "PENDING"\n}'
    },
    {
      method: 'POST',
      category: 'groups',
      path: '/api/groups/:groupId/approve/:requestId',
      auth: 'Bearer JWT (Group ADMIN)',
      summary: 'Approve Pending Member Request',
      desc: 'Approves a user request, transitions status to APPROVED, and creates a GroupMember record inside an atomic transaction.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/groups/1/approve/10 \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Params: groupId, requestId)',
      response: '{\n  "message": "Member approved successfully",\n  "membership": { "groupId": 1, "userId": 3, "role": "MEMBER" }\n}'
    },
    {
      method: 'POST',
      category: 'groups',
      path: '/api/groups/:groupId/reject/:requestId',
      auth: 'Bearer JWT (Group ADMIN)',
      summary: 'Reject Pending Member Request',
      desc: 'Rejects a join request and removes it from the pending queue.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/groups/1/reject/10 \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Params: groupId, requestId)',
      response: '{\n  "message": "Join request rejected"\n}'
    },
    {
      method: 'POST',
      category: 'groups',
      path: '/api/groups/:groupId/invite',
      auth: 'Bearer JWT (Group Member)',
      summary: 'Directly Add Member via Search',
      desc: 'Directly adds a known platform user to the group by their email or username.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/groups/1/invite \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "hassan@example.com"}'`,
      body: '{\n  "email": "hassan@example.com"\n}',
      response: '{\n  "message": "User added to group successfully"\n}'
    },
    {
      method: 'DELETE',
      category: 'groups',
      path: '/api/groups/:groupId',
      auth: 'Bearer JWT (Group Creator / ADMIN)',
      summary: 'Cascade Delete Group',
      desc: 'Executes an atomic transaction deleting group, expenses, payers, participants, settlements, reminders, and memberships.',
      curl: `curl -X DELETE https://98.92.49.144.sslip.io/api/groups/1 \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Param: groupId)',
      response: '{\n  "message": "Group and all related records deleted successfully"\n}'
    },

    // Expense Endpoints
    {
      method: 'POST',
      category: 'expenses',
      path: '/api/expenses',
      auth: 'Bearer JWT (Group Member)',
      summary: 'Create Multi-Payer Shared Expense',
      desc: 'Records an expense with single or multiple payers and calculates equal or custom participant share splits inside an atomic transaction.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/expenses \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"groupId": 1, "description": "Hostel Groceries", "totalAmount": 8000, "paidById": 1, "payers": [{"userId": 1, "amountPaid": 8000}], "participants": [{"userId": 1, "shareAmount": 2000}, {"userId": 2, "shareAmount": 2000}, {"userId": 3, "shareAmount": 2000}, {"userId": 4, "shareAmount": 2000}]}'`,
      body: '{\n  "groupId": 1,\n  "description": "Hostel Groceries",\n  "totalAmount": 8000,\n  "paidById": 1,\n  "payers": [{ "userId": 1, "amountPaid": 8000 }],\n  "participants": [\n    { "userId": 1, "shareAmount": 2000 },\n    { "userId": 2, "shareAmount": 2000 },\n    { "userId": 3, "shareAmount": 2000 },\n    { "userId": 4, "shareAmount": 2000 }\n  ]\n}',
      response: '{\n  "id": 15,\n  "groupId": 1,\n  "description": "Hostel Groceries",\n  "totalAmount": 800000,\n  "createdAt": "2026-08-27T12:00:00.000Z"\n}'
    },
    {
      method: 'GET',
      category: 'expenses',
      path: '/api/expenses/group/:groupId',
      auth: 'Bearer JWT (Group Member)',
      summary: 'List All Group Expenses',
      desc: 'Returns chronological list of expenses in the group with payers and participant shares.',
      curl: `curl -X GET https://98.92.49.144.sslip.io/api/expenses/group/1 \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Param: groupId)',
      response: '[\n  {\n    "id": 15,\n    "description": "Hostel Groceries",\n    "totalAmount": 800000,\n    "paidBy": { "id": 1, "name": "Ali" },\n    "createdAt": "2026-08-27T12:00:00.000Z"\n  }\n]'
    },
    {
      method: 'PUT',
      category: 'expenses',
      path: '/api/expenses/:id',
      auth: 'Bearer JWT (Expense Creator / Payer)',
      summary: 'Edit Expense & Append Audit History',
      desc: 'Updates amount, description, or participant shares while creating an immutable snapshot record in ExpenseEditHistory.',
      curl: `curl -X PUT https://98.92.49.144.sslip.io/api/expenses/15 \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"description": "Hostel Groceries + Fruit", "totalAmount": 9000}'`,
      body: '{\n  "description": "Hostel Groceries + Fruit",\n  "totalAmount": 9000\n}',
      response: '{\n  "message": "Expense updated successfully",\n  "expense": { "id": 15, "totalAmount": 900000 }\n}'
    },
    {
      method: 'DELETE',
      category: 'expenses',
      path: '/api/expenses/:id',
      auth: 'Bearer JWT (Expense Creator / Payer)',
      summary: 'Delete Shared Expense',
      desc: 'Cascades deletion across payers, participants, and edit history inside an atomic transaction, restoring group net balances.',
      curl: `curl -X DELETE https://98.92.49.144.sslip.io/api/expenses/15 \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Param: id)',
      response: '{\n  "message": "Expense deleted successfully"\n}'
    },

    // Settlement Endpoints
    {
      method: 'POST',
      category: 'settlements',
      path: '/api/settlements',
      auth: 'Bearer JWT (Multipart/Form-Data)',
      summary: 'Initiate Debt Settlement with Proof Screenshot',
      desc: 'Records repayment between debtor and creditor. Checks duplicate pending settlement guard and sets status to AWAITING_VERIFICATION.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/settlements \\
  -H "Authorization: Bearer <TOKEN>" \\
  -F "groupId=1" \\
  -F "payeeId=1" \\
  -F "amount=2000" \\
  -F "screenshot=@/path/to/easypaisa-receipt.png"`,
      body: 'FormData { groupId: 1, payeeId: 1, amount: 2000, screenshot: File }',
      response: '{\n  "id": 8,\n  "groupId": 1,\n  "payerId": 2,\n  "payeeId": 1,\n  "amount": 200000,\n  "status": "AWAITING_VERIFICATION"\n}'
    },
    {
      method: 'POST',
      category: 'settlements',
      path: '/api/settlements/:id/confirm',
      auth: 'Bearer JWT (Settlement Payee)',
      summary: 'Payee Verifies & Confirms Settlement',
      desc: 'Payee confirms receipt of funds. Updates status to CONFIRMED and applies balance reductions to the group graph.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/settlements/8/confirm \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Param: id)',
      response: '{\n  "id": 8,\n  "status": "CONFIRMED",\n  "confirmedAt": "2026-08-27T12:30:00.000Z"\n}'
    },
    {
      method: 'POST',
      category: 'settlements',
      path: '/api/settlements/:id/reject',
      auth: 'Bearer JWT (Settlement Payee)',
      summary: 'Payee Rejects Settlement',
      desc: 'Marks settlement as REJECTED without modifying group balances, allowing debtor to re-submit with correct proof.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/settlements/8/reject \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None (URL Param: id)',
      response: '{\n  "id": 8,\n  "status": "REJECTED"\n}'
    },
    {
      method: 'POST',
      category: 'settlements',
      path: '/api/settlements/remind',
      auth: 'Bearer JWT (Creditor)',
      summary: 'Send 1-Click Settlement Nudge',
      desc: 'Dispatches manual email reminder and in-app bell notification to debtor with 7-day cooldown anti-spam protection.',
      curl: `curl -X POST https://98.92.49.144.sslip.io/api/settlements/remind \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"groupId": 1, "debtorId": 2}'`,
      body: '{\n  "groupId": 1,\n  "debtorId": 2\n}',
      response: '{\n  "message": "Reminder sent successfully via email and in-app alert"\n}'
    },

    // User & Analytics Endpoints
    {
      method: 'GET',
      category: 'users',
      path: '/api/users/dashboard',
      auth: 'Bearer JWT',
      summary: 'User Financial Summary & Stat KPIs',
      desc: 'Returns overall total owed, total owes, active groups count, pending join requests, and pending verifications for the user.',
      curl: `curl -X GET https://98.92.49.144.sslip.io/api/users/dashboard \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None',
      response: '{\n  "totalOwed": 400000,\n  "totalOwes": 200000,\n  "activeGroups": 2,\n  "pendingJoinRequests": [],\n  "pendingVerifications": 1\n}'
    },
    {
      method: 'GET',
      category: 'users',
      path: '/api/users/activity',
      auth: 'Bearer JWT',
      summary: 'Global User Activity Feed',
      desc: 'Returns chronological stream of user expenses, group joins, and confirmed settlements with filter metrics.',
      curl: `curl -X GET https://98.92.49.144.sslip.io/api/users/activity \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'None',
      response: '[\n  {\n    "id": 15,\n    "type": "EXPENSE",\n    "description": "Hostel Groceries",\n    "amount": 800000,\n    "timestamp": "2026-08-27T12:00:00.000Z"\n  }\n]'
    },
    {
      method: 'GET',
      category: 'users',
      path: '/api/users/search',
      auth: 'Bearer JWT (Min 2 chars query)',
      summary: 'Privacy-Compliant Targeted User Search',
      desc: 'Searches users by name or email with a mandatory 2-character minimum query requirement to protect user privacy.',
      curl: `curl -X GET "https://98.92.49.144.sslip.io/api/users/search?q=zain" \\
  -H "Authorization: Bearer <TOKEN>"`,
      body: 'Query Param: q=zain',
      response: '[\n  { "id": 2, "name": "Zain", "email": "zain@example.com" }\n]'
    },
    {
      method: 'PUT',
      category: 'users',
      path: '/api/users/profile',
      auth: 'Bearer JWT',
      summary: 'Update Profile & Payment Receiving Account',
      desc: 'Updates user display name, currency, or payment receiving account (EasyPaisa, JazzCash, Raast, Sadapay, Nayapay, Bank IBAN).',
      curl: `curl -X PUT https://98.92.49.144.sslip.io/api/users/profile \\
  -H "Authorization: Bearer <TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Ali Khan", "paymentMethod": "EasyPaisa: 0300-1234567"}'`,
      body: '{\n  "name": "Ali Khan",\n  "paymentMethod": "EasyPaisa: 0300-1234567"\n}',
      response: '{\n  "message": "Profile updated successfully",\n  "user": { "id": 1, "name": "Ali Khan", "paymentMethod": "EasyPaisa: 0300-1234567" }\n}'
    }
  ];

  const filteredEndpoints = allApiEndpoints.filter(e => {
    const matchesCategory = apiCategory === 'all' || e.category === apiCategory;
    const matchesSearch = searchQuery === '' || 
      e.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="docs-container font-['Plus_Jakarta_Sans',_sans-serif]">
      
      {/* Top Floating Glass Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#080c14]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/20 group-hover:scale-105 transition-transform">
              SE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight">Split<span className="text-blue-500">Ease</span></span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Documentation & API Manual
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Collaborative Expense Splitting & Debt Settlement Engine</p>
            </div>
          </Link>
        </div>

        {/* Global Search & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input 
              type="text" 
              placeholder="Search components, APIs, algorithms, schemas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to App
          </button>
        </div>
      </header>

      {/* Main Documentation Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex gap-8">
        
        {/* Left Sticky Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3 px-2">Documentation Sections</p>
              <nav className="space-y-1">
                {sections.map((sec) => {
                  const Icon = sec.icon;
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={() => setActiveSection(sec.id)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold sidebar-link ${
                        isActive ? 'active' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                      <span className="truncate">{sec.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Quick Live Link Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-blue-950/20 border border-indigo-900/40 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                <Sparkles size={14} /> Live HTTPS Server
              </div>
              <p className="text-[11px] text-slate-400">SplitEase runs on AWS EC2 with automated SSL and 100% ACID persistence.</p>
              <a 
                href="https://98.92.49.144.sslip.io" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between text-xs font-mono text-blue-400 hover:text-blue-300 bg-slate-900/90 border border-slate-800 p-2 rounded-xl"
              >
                <span className="truncate">98.92.49.144.sslip.io</span>
                <Globe size={13} className="flex-shrink-0 ml-1" />
              </a>
            </div>
          </div>
        </aside>

        {/* Main Documentation Content Area */}
        <main className="flex-1 min-w-0 space-y-16 pb-20">

          {/* Hero Banner */}
          <div className="docs-card p-8 sm:p-10 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/40">
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold text-blue-400 mb-4">
                <Shield size={13} /> Complete User Guide, Architecture & API Reference
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
                SplitEase Client Documentation Portal
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                Welcome to the complete official documentation for <strong>SplitEase</strong>. Whether you are a general user wanting to split bills, a business client evaluating our platform, or a developer integrating our REST API, this manual explains every feature, component, algorithm, and backend endpoint in detail.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xl font-black text-blue-400">22 APIs</div>
                  <div className="text-[11px] text-slate-400 font-medium">Documented Endpoints</div>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xl font-black text-emerald-400">8 Modules</div>
                  <div className="text-[11px] text-slate-400 font-medium">Mapped Components</div>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xl font-black text-purple-400">O(N log N)</div>
                  <div className="text-[11px] text-slate-400 font-medium">Graph Engine</div>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl">
                  <div className="text-xl font-black text-amber-400">0.00%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Float Math Error</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: User Quickstart & Product Guide */}
          <section id="quickstart" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">1. User Quickstart & Feature Guide</h2>
                <p className="text-xs text-slate-400">How general users and groups operate SplitEase in 4 simple steps</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">1</span>
                    Create or Join an Expense Group
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Create a group for your roommates, trip, or team. SplitEase automatically generates a unique 6-character invite code (e.g. <code className="text-blue-400 font-mono">PUH19</code>) and a 1-click WhatsApp share link. Friends submit join requests and admins approve them in 1 click.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs">2</span>
                    Add Shared Bills & Multi-Payer Expenses
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Log any expense with flexible payment options: single payer or multiple payers (e.g., 2 people paid Rs. 8,000 combined). Split costs equally or customize individual share amounts.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs">3</span>
                    Review Simplified Group Debts
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Instead of having everyone pay everyone back across 12 confusing transactions, our mathematical engine simplifies the debt graph down to minimal direct payments (e.g., Zain pays Ali Rs. 2,000).
                  </p>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">4</span>
                    Settle Up with Proof & Confirmation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click <strong>Settle Up</strong>, view your friend's verified EasyPaisa/JazzCash/Bank account, upload your receipt screenshot, and submit. The recipient receives an instant notification and confirms with 1 click!
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Component Architecture & API Mapping */}
          <section id="components" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Code2 size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">2. Component Architecture & Frontend-to-Backend API Mapping</h2>
                <p className="text-xs text-slate-400">Exhaustive architectural breakdown of every UI module, its role, and the exact REST APIs it invokes</p>
              </div>
            </div>

            <div className="space-y-4">
              {frontendComponents.map((comp, idx) => {
                const Icon = comp.icon;
                return (
                  <div key={idx} className="docs-card p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                          <Icon size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white font-mono">{comp.name}</h3>
                          <span className="text-[11px] text-blue-400 font-medium">{comp.role}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{comp.description}</p>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Invoked Backend API Endpoints:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {comp.apis.map((api, aIdx) => (
                          <div key={aIdx} className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-xl flex flex-col justify-between">
                            <span className="font-mono text-xs font-bold text-indigo-300">{api.endpoint}</span>
                            <span className="text-[11px] text-slate-400 mt-1">{api.purpose}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 3: Overview & System Architecture */}
          <section id="overview" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">3. System Topology & Technology Stack</h2>
                <p className="text-xs text-slate-400">High-level architectural topology and full-stack runtime specification</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">System Architecture Topology</h3>
              
              <div className="docs-code-block p-5 text-xs text-slate-300 overflow-x-auto font-mono leading-relaxed">
{`+-----------------------------------------------------------------------------------+
|                            CLIENT TIER (React 18 + Vite 8)                        |
|   +-----------------------+   +------------------------+   +------------------+   |
|   | Dashboard & Balances  |   | Multi-Payer Bill Modal |   | Settle-Up Module |   |
|   +-----------------------+   +------------------------+   +------------------+   |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS 256-bit TLS (Port 443)
                                          v
+-----------------------------------------------------------------------------------+
|                        SECURITY & REVERSE PROXY (Nginx + SSL)                     |
|   * Certbot TLS Encryption    * Gzip Asset Compression     * Origin Verification  |
+-----------------------------------------+-----------------------------------------+
                                          | Reverse Proxy (Port 4000)
                                          v
+-----------------------------------------------------------------------------------+
|                     APPLICATION SERVER (Express 5.x + Node.js)                    |
|   * Helmet Security Headers   * Rate Limiters (Global/Auth)* JWT 1h + Refresh 7d  |
|   * Zod Schema Validation     * Group RBAC Guard           * Multer Upload Armor  |
|   * Debt Simplification Engine* Integer Paisa Arithmetic   * Automated Cron Jobs  |
+-----------------------------------------+-----------------------------------------+
                                          | Connection Pool
                                          v
+-----------------------------------------------------------------------------------+
|                  DATA PERSISTENCE & ACID TRANSACTIONS (PostgreSQL 16)             |
|   * 10 Relational Tables      * B-Tree Relational Indexes  * Cascade Deletion     |
|   * Immutable Audit History   * Paisa Integer Storage      * Prisma ORM Engine    |
+-----------------------------------------------------------------------------------+`}
              </div>
            </div>
          </section>

          {/* Section 4: Mathematical Debt Simplification Engine */}
          <section id="algorithm" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cpu size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">4. Debt Simplification & Graph Algorithm Engine</h2>
                <p className="text-xs text-slate-400">Mathematical principles, conservation theorems, and interactive debt simulator</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">1. Conservation of Net Balances</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Financial relations within any group of <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded">N</code> members are represented as a directed weighted graph <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded">G = (V, E)</code>. For each user <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded">i</code>, their net balance <code className="text-blue-400 bg-slate-950 px-1.5 py-0.5 rounded">B_i</code> is strictly defined as:
                </p>
                <div className="docs-code-block p-4 text-center text-sm font-mono text-indigo-300 font-bold">
                  B_i = Total Amount Paid_i - Total Owed Share_i + Settlements Out_i - Settlements In_i
                </div>
                <div className="p-3.5 bg-blue-950/30 border border-blue-900/40 rounded-xl text-xs text-blue-300 flex items-center gap-2">
                  <Sparkles size={16} className="text-blue-400 flex-shrink-0" />
                  <span><strong>Zero-Sum Invariant:</strong> In any closed group, the sum of all individual balances strictly sums to zero: <strong>&Sigma; B_i = 0</strong>.</span>
                </div>
              </div>

              {/* Interactive Debt Simulator Playground */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Play size={16} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Interactive Debt Playground</h3>
                  </div>
                  <span className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                    Real-time Graph Execution
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950/80 p-5 border border-slate-800 rounded-2xl">
                  
                  {/* Left: Members Table */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">1. Group Members & Expenses</span>
                      <span className="text-[11px] text-slate-400">{members.length} Members</span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {members.map((m) => {
                        const net = m.paid - m.share;
                        return (
                          <div key={m.id} className="flex items-center justify-between bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-xl text-xs">
                            <div>
                              <span className="font-bold text-white">{m.name}</span>
                              <div className="text-[10px] text-slate-400">
                                Paid: Rs. {m.paid} | Share: Rs. {m.share}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                                net > 0 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 
                                net < 0 ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' : 'text-slate-400 bg-slate-800'
                              }`}>
                                {net > 0 ? `+Rs. ${net}` : net < 0 ? `-Rs. ${Math.abs(net)}` : 'Rs. 0'}
                              </span>
                              <button onClick={() => removeMember(m.id)} className="text-slate-500 hover:text-rose-400 p-1">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Member Row */}
                    <div className="flex items-center gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="Name" 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)} 
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                      <input 
                        type="number" 
                        placeholder="Paid" 
                        value={newPaid} 
                        onChange={(e) => setNewPaid(e.target.value === '' ? '' : Number(e.target.value))} 
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                      <input 
                        type="number" 
                        placeholder="Share" 
                        value={newShare} 
                        onChange={(e) => setNewShare(e.target.value === '' ? '' : Number(e.target.value))} 
                        className="w-20 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                      <button 
                        onClick={addMember}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-xs font-bold transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Right: Simplified Graph Outputs */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-300 uppercase">2. Simplified Settlements Output</span>
                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {simplifiedTransfers.length} Transfers
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {simplifiedTransfers.length === 0 ? (
                        <div className="p-6 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                          All balances are settled (Net balance = 0).
                        </div>
                      ) : (
                        simplifiedTransfers.map((t, idx) => (
                          <div key={idx} className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-rose-400">{t.from}</span>
                              <span className="text-slate-500 font-mono">&rarr;</span>
                              <span className="font-bold text-emerald-400">{t.to}</span>
                            </div>
                            <span className="font-mono font-bold text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                              Rs. {t.amount.toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                      💡 <strong>Algorithm Result:</strong> The greedy algorithm matches the highest debtors and highest creditors iteratively, eliminating circular transactions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Zero Floating-Point Math */}
          <section id="precision" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">5. Zero Floating-Point Financial Precision</h2>
                <p className="text-xs text-slate-400">Elimination of IEEE 754 precision loss via Integer-Paisa accounting</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Standard JavaScript numbers and database floating-point columns (<code className="text-red-400">FLOAT / DOUBLE</code>) use IEEE 754 binary fractions, causing rounding errors in financial transactions (e.g. <code className="text-red-400 font-mono">0.1 + 0.2 = 0.30000000000000004</code>). Over thousands of expense splits, this creates phantom debts and balance mismatches.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    &times; IEEE 754 Floating-Point Hazard
                  </div>
                  <div className="docs-code-block p-3 text-[11px] font-mono text-rose-300">
                    // Binary Floating Point Rounding Error<br/>
                    0.1 + 0.2 === 0.3 // false!<br/>
                    0.1 + 0.2 // 0.30000000000000004
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    &check; SplitEase Integer-Paisa Guarantee
                  </div>
                  <div className="docs-code-block p-3 text-[11px] font-mono text-emerald-300">
                    // Integer Paisa Arithmetic (PostgreSQL)<br/>
                    rupeeToPaisa(150.50) // 15050 Paisa<br/>
                    paisaToRupee(15050)  // "150.50 PKR"
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Database Schema & Indexes */}
          <section id="database" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">6. Database Architecture & Relational Schema</h2>
                <p className="text-xs text-slate-400">PostgreSQL relational models, foreign key cardinalities, and B-Tree performance indexing</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span>User Model</span>
                    <span className="text-[10px] text-slate-500 font-mono">10 Relations</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Stores user credentials, password hash, and receiving payment accounts.</p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                    <div>• <span className="text-indigo-400">id</span>: Int [PK]</div>
                    <div>• <span className="text-indigo-400">email</span>: String [Unique]</div>
                    <div>• <span className="text-indigo-400">paymentMethod</span>: String?</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span>Group Model</span>
                    <span className="text-[10px] text-slate-500 font-mono">B-Tree Indexed</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Expense group container with unique alphanumeric join codes.</p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                    <div>• <span className="text-indigo-400">id</span>: Int [PK]</div>
                    <div>• <span className="text-indigo-400">name</span>: String</div>
                    <div>• <span className="text-indigo-400">inviteCode</span>: String [Unique]</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Expense & Payers</span>
                    <span className="text-[10px] text-slate-500 font-mono">Integer Paisa</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Supports multi-payer contributions and uneven participant share splitting.</p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                    <div>• <span className="text-indigo-400">totalAmount</span>: Int (Paisa)</div>
                    <div>• <span className="text-indigo-400">groupId, paidById</span> [Indexed]</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Settlement & Proof</span>
                    <span className="text-[10px] text-slate-500 font-mono">Two-Way Handshake</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Tracks direct debt repayments with screenshot verification proofs.</p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                    <div>• <span className="text-indigo-400">status</span>: AWAITING | CONFIRMED</div>
                    <div>• <span className="text-indigo-400">groupId, payerId, payeeId</span> [Indexed]</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Core Sequence Workflows */}
          <section id="workflows" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <GitBranch size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">7. Core Sequence Workflows</h2>
                <p className="text-xs text-slate-400">End-to-end execution flows for authentication, expenses, settlements, and cron jobs</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-6">
              
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">Workflow A: Stateless 1h Access Token + 7d Silent Refresh Rotation</h3>
                <div className="docs-code-block p-4 text-xs font-mono text-slate-300 overflow-x-auto">
{`Client Browser                      API Server (Express)                PostgreSQL
      |                                      |                               |
      |-- 1. POST /api/auth/login ---------->|                               |
      |   (email, password)                  |-- 2. Validate bcrypt hash --->|
      |                                      |<-- 3. Return User Record -----|
      |<-- 4. Set-Cookie: httpOnly refresh --|                               |
      |       Return { accessToken (1h) }    |                               |
      |                                      |                               |
      |-- 5. API Request (Bearer Token) ---->|                               |
      |<-- 6. Returns 401 (Token Expired) ---|                               |
      |                                      |                               |
      |-- 7. Axios Interceptor /refresh ---->|                               |
      |   (Cookie sent automatically)        |-- 8. Verify refresh token ----|
      |<-- 9. Returns new accessToken (1h) --|                               |
      |-- 10. Seamlessly retries request --->|`}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white">Workflow B: Settlement Initiation & Payee Confirmation</h3>
                <div className="docs-code-block p-4 text-xs font-mono text-slate-300 overflow-x-auto">
{`Debtor (Zain)                        API Server                     Creditor (Ali)
      |                                  |                                  |
      |-- 1. Settle Up (Rs. 2,000) ----->|                                  |
      |   + Payment Screenshot           |-- 2. Status: AWAITING ---------->| (In-app Notification)
      |                                  |                                  |
      |                                  |<-- 3. Payee Views Proof & Clicks |
      |                                  |       POST /settlements/:id/confirm
      |                                  |                                  |
      |<-- 4. Net Balances Updated in DB + Transaction Recorded ------------|`}
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Security & Rate Limiting */}
          <section id="security" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">8. Enterprise Security & Defensive Hardening</h2>
                <p className="text-xs text-slate-400">Multi-tier protection against OWASP Top 10 vulnerabilities</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="text-rose-400 font-bold flex items-center gap-2">
                    <Shield size={15} /> 3-Tier Multi-Rate Limiter
                  </div>
                  <ul className="text-slate-400 space-y-1 text-[11px]">
                    <li>• <strong>Global Limiter:</strong> 300 req / 15 min (DDoS protection)</li>
                    <li>• <strong>Auth Limiter:</strong> 50 req / 15 min (Brute-force prevention)</li>
                    <li>• <strong>Invite Limiter:</strong> 20 req / 15 min (Code enumeration shield)</li>
                  </ul>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="text-blue-400 font-bold flex items-center gap-2">
                    <Lock size={15} /> XSS & CSRF Token Armor
                  </div>
                  <ul className="text-slate-400 space-y-1 text-[11px]">
                    <li>• <strong>httpOnly Cookies:</strong> Refresh tokens are unreadable by JavaScript</li>
                    <li>• <strong>SameSite Strict:</strong> Prevents Cross-Site Request Forgery</li>
                    <li>• <strong>Helmet Headers:</strong> Disables MIME sniffing and clickjacking</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 9: Exhaustive REST API Reference */}
          <section id="api" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Terminal size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">9. Exhaustive REST API Reference ({allApiEndpoints.length} Endpoints)</h2>
                <p className="text-xs text-slate-400">Complete API catalog with sample JSON requests, headers, responses, and 1-click cURL commands</p>
              </div>
            </div>

            {/* API Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(['all', 'auth', 'groups', 'expenses', 'settlements', 'users'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setApiCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    apiCategory === cat 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat} ({cat === 'all' ? allApiEndpoints.length : allApiEndpoints.filter(e => e.category === cat).length})
                </button>
              ))}
            </div>

            {/* Endpoints List */}
            <div className="space-y-5">
              {filteredEndpoints.map((ep, idx) => (
                <div key={idx} className="docs-card p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black font-mono ${
                        ep.method === 'GET' ? 'badge-get' :
                        ep.method === 'POST' ? 'badge-post' :
                        ep.method === 'PUT' ? 'badge-put' : 'badge-delete'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">{ep.path}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                        {ep.auth}
                      </span>
                      <span className="text-xs text-slate-300 font-bold">{ep.summary}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{ep.desc}</p>

                  {/* cURL Request Snippet */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                      <span className="flex items-center gap-1.5"><Terminal size={12} /> cURL Command</span>
                      <button 
                        onClick={() => copyToClipboard(ep.curl, `curl-${idx}`)}
                        className="hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                      >
                        {copiedKey === `curl-${idx}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        {copiedKey === `curl-${idx}` ? 'Copied' : 'Copy cURL'}
                      </button>
                    </div>
                    <pre className="docs-code-block p-3 text-[11px] text-amber-300 overflow-x-auto">
                      {ep.curl}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                        <span>Request Body</span>
                        <button 
                          onClick={() => copyToClipboard(ep.body, `req-${idx}`)}
                          className="hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          {copiedKey === `req-${idx}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copiedKey === `req-${idx}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="docs-code-block p-3 text-[11px] text-blue-300 overflow-x-auto max-h-36">
                        {ep.body}
                      </pre>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                        <span>Response (200 / 201)</span>
                        <button 
                          onClick={() => copyToClipboard(ep.response, `res-${idx}`)}
                          className="hover:text-white flex items-center gap-1 text-[10px] cursor-pointer"
                        >
                          {copiedKey === `res-${idx}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          {copiedKey === `res-${idx}` ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <pre className="docs-code-block p-3 text-[11px] text-emerald-300 overflow-x-auto max-h-36">
                        {ep.response}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 10: DevOps, AWS EC2 & CI/CD */}
          <section id="devops" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Server size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">10. AWS EC2 Production & CI/CD Deployment</h2>
                <p className="text-xs text-slate-400">Cloud infrastructure topology, Nginx reverse proxy, PM2 process management, and GitHub Actions</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
                  <div className="font-bold text-white">AWS EC2 Server</div>
                  <p className="text-slate-400 text-[11px]">Ubuntu 24.04 LTS running in AWS us-east-1 with automated security patches.</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
                  <div className="font-bold text-white">Nginx & Certbot SSL</div>
                  <p className="text-slate-400 text-[11px]">Terminates HTTPS on port 443, serves static Vite bundle, and proxies <code className="text-blue-400">/api/</code> to Express.</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1.5">
                  <div className="font-bold text-white">GitHub Actions CI/CD</div>
                  <p className="text-slate-400 text-[11px]">Every <code className="text-blue-400">git push origin main</code> runs automated builds and zero-downtime SSH deployments.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 11: FAQs & Edge Cases */}
          <section id="faqs" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <HelpCircle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">11. Client & Developer FAQs</h2>
                <p className="text-xs text-slate-400">Common questions, edge case handling, and financial invariants</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-bold text-white">Q1: What happens if an expense is deleted or modified?</h4>
                <p className="text-slate-300 leading-relaxed">
                  All modifications append an immutable snapshot record to the <code className="text-indigo-400">ExpenseEditHistory</code> table. When an expense is deleted, Prisma executes an atomic cascade rollback removing payer and participant rows and restoring net balances.
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                <h4 className="font-bold text-white">Q2: Can a debtor submit duplicate settlements accidentally?</h4>
                <p className="text-slate-300 leading-relaxed">
                  No. The backend enforces a duplicate settlement check: if a payer already has a settlement with status <code className="text-amber-400">AWAITING_VERIFICATION</code> with the same payee in the same group, new requests are blocked until the payee confirms or rejects.
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                <h4 className="font-bold text-white">Q3: How does the daily reminder email cron work?</h4>
                <p className="text-slate-300 leading-relaxed">
                  Every morning at 09:00 AM, a <code className="text-indigo-400">node-cron</code> job scans for unsettled debts older than 7 days. If a debtor/creditor pair was notified within the last 7 days, the system enforces an anti-spam cooldown via the <code className="text-indigo-400">SettlementReminderLog</code> table.
                </p>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <div className="p-8 docs-card text-center space-y-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900">
            <h3 className="text-xl font-black text-white">Ready to Split Shared Expenses with SplitEase?</h3>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Experience zero floating-point errors, multi-payer splits, and greedy debt reduction live on our production deployment.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/25 cursor-pointer flex items-center gap-1.5"
              >
                <span>Log In to SplitEase</span>
                <ExternalLink size={13} />
              </button>
              <button 
                onClick={() => navigate('/')}
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Open Dashboard
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
