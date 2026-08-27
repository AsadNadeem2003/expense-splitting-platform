import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Cpu, Database, GitBranch, Terminal, 
  ArrowLeft, Search, Check, Copy, Sparkles, Server, 
  Layers, Lock, Play, Plus, Trash2, Globe
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
  const [activeSection, setActiveSection] = useState('overview');
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

  // Section Navigation Links
  const sections = [
    { id: 'overview', title: '1. Overview & Architecture', icon: Layers, category: 'Core' },
    { id: 'algorithm', title: '2. Debt Simplification Engine', icon: Cpu, category: 'Mathematics' },
    { id: 'precision', title: '3. Zero Floating-Point Math', icon: Shield, category: 'Mathematics' },
    { id: 'database', title: '4. Database ERD & Indexes', icon: Database, category: 'Data Layer' },
    { id: 'workflows', title: '5. Core Sequence Workflows', icon: GitBranch, category: 'Logic' },
    { id: 'security', title: '6. Enterprise Security Architecture', icon: Lock, category: 'Security' },
    { id: 'api', title: '7. REST API Reference', icon: Terminal, category: 'Endpoints' },
    { id: 'devops', title: '8. AWS EC2 & CI/CD Deployment', icon: Server, category: 'DevOps' },
  ];

  // API Endpoints Spec
  const apiEndpoints = [
    {
      method: 'POST',
      category: 'auth',
      path: '/api/auth/register',
      summary: 'Register New User Account',
      desc: 'Creates a new user with salted bcrypt password hashing and issues a 1-hour access token + 7-day httpOnly refresh cookie.',
      body: '{\n  "name": "Ali Khan",\n  "email": "ali@example.com",\n  "password": "SecurePassword123!"\n}',
      response: '{\n  "message": "User registered successfully",\n  "accessToken": "eyJhbGciOiJIUzI1Ni...",\n  "user": {\n    "id": 1,\n    "name": "Ali Khan",\n    "email": "ali@example.com"\n  }\n}'
    },
    {
      method: 'POST',
      category: 'auth',
      path: '/api/auth/login',
      summary: 'Authenticate User',
      desc: 'Validates credentials, checks rate limiting (50 req/15min), and returns JWT tokens.',
      body: '{\n  "email": "ali@example.com",\n  "password": "SecurePassword123!"\n}',
      response: '{\n  "accessToken": "eyJhbGciOiJIUzI1Ni...",\n  "user": { "id": 1, "name": "Ali Khan", "email": "ali@example.com" }\n}'
    },
    {
      method: 'POST',
      category: 'auth',
      path: '/api/auth/refresh',
      summary: 'Silent Refresh Token Rotation',
      desc: 'Validates long-lived httpOnly refresh cookie and issues a fresh 1-hour access token.',
      body: '{}',
      response: '{\n  "accessToken": "eyJhbGciOiJIUzI1Ni..."\n}'
    },
    {
      method: 'POST',
      category: 'groups',
      path: '/api/groups',
      summary: 'Create New Expense Group',
      desc: 'Generates a unique 6-character alphanumeric invite code and sets creator as ADMIN.',
      body: '{\n  "name": "Murree Trip 2026"\n}',
      response: '{\n  "id": 4,\n  "name": "Murree Trip 2026",\n  "inviteCode": "MUR26X",\n  "createdById": 1,\n  "role": "ADMIN"\n}'
    },
    {
      method: 'GET',
      category: 'groups',
      path: '/api/groups/:id/balances',
      summary: 'Compute Group Balances & Debt Graph',
      desc: 'Calculates net balances and runs the greedy debt simplification algorithm to return minimal required settlement transfers.',
      body: 'None (URL Param: id)',
      response: '{\n  "netBalances": [\n    { "userId": 1, "userName": "Ali", "balance": 400000 },\n    { "userId": 2, "userName": "Zain", "balance": -200000 },\n    { "userId": 3, "userName": "Hassan", "balance": -200000 }\n  ],\n  "simplifiedDebts": [\n    { "from": 2, "fromName": "Zain", "to": 1, "toName": "Ali", "amount": 200000 },\n    { "from": 3, "fromName": "Hassan", "to": 1, "toName": "Ali", "amount": 200000 }\n  ]\n}'
    },
    {
      method: 'POST',
      category: 'groups',
      path: '/api/groups/join',
      summary: 'Submit Join Request via Invite Code',
      desc: 'Submits a join request with duplicate membership check and alerts group admins in real-time.',
      body: '{\n  "inviteCode": "MUR26X"\n}',
      response: '{\n  "id": 12,\n  "groupId": 4,\n  "userId": 5,\n  "status": "PENDING"\n}'
    },
    {
      method: 'POST',
      category: 'expenses',
      path: '/api/expenses',
      summary: 'Create Multi-Payer Shared Expense',
      desc: 'Records expense with single or multiple payers and calculates equal/custom participant share allocations inside an atomic database transaction.',
      body: '{\n  "groupId": 4,\n  "description": "Dinner at Monal",\n  "totalAmount": 9000,\n  "paidById": 1,\n  "payers": [\n    { "userId": 1, "amountPaid": 6000 },\n    { "userId": 2, "amountPaid": 3000 }\n  ],\n  "participants": [\n    { "userId": 1, "shareAmount": 3000 },\n    { "userId": 2, "shareAmount": 3000 },\n    { "userId": 3, "shareAmount": 3000 }\n  ]\n}',
      response: '{\n  "id": 18,\n  "groupId": 4,\n  "description": "Dinner at Monal",\n  "totalAmount": 900000,\n  "createdAt": "2026-08-27T10:00:00.000Z"\n}'
    },
    {
      method: 'POST',
      category: 'settlements',
      path: '/api/settlements',
      summary: 'Submit Direct Debt Settlement',
      desc: 'Initiates a payment with screenshot proof. Enforces duplicate settlement prevention and sets status to AWAITING_VERIFICATION.',
      body: '{\n  "groupId": 4,\n  "payeeId": 1,\n  "amount": 2000,\n  "screenshotUrl": "/uploads/settlements/proof-123.png"\n}',
      response: '{\n  "id": 8,\n  "groupId": 4,\n  "payerId": 2,\n  "payeeId": 1,\n  "amount": 200000,\n  "status": "AWAITING_VERIFICATION"\n}'
    },
    {
      method: 'POST',
      category: 'settlements',
      path: '/api/settlements/:id/confirm',
      summary: 'Payee Verifies & Confirms Settlement',
      desc: 'Payee confirms receipt of funds. Updates settlement status to CONFIRMED and applies balance reductions to the group graph.',
      body: 'None (URL Param: id)',
      response: '{\n  "id": 8,\n  "status": "CONFIRMED",\n  "confirmedAt": "2026-08-27T10:15:00.000Z"\n}'
    },
    {
      method: 'GET',
      category: 'users',
      path: '/api/users/dashboard',
      summary: 'User Financial Dashboard Stats',
      desc: 'Returns overall total owed to user, total user owes, active group count, pending join requests, and pending verifications.',
      body: 'None (Auth Bearer Token required)',
      response: '{\n  "totalOwed": 450000,\n  "totalOwes": 120000,\n  "activeGroups": 3,\n  "pendingJoinRequests": [],\n  "pendingVerifications": 1\n}'
    }
  ];

  const filteredEndpoints = apiEndpoints.filter(e => {
    const matchesCategory = apiCategory === 'all' || e.category === apiCategory;
    const matchesSearch = searchQuery === '' || 
      e.path.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="docs-container font-['Plus_Jakarta_Sans',_sans-serif]">
      {/* Top Floating Glass Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/20 group-hover:scale-105 transition-transform">
              SE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white tracking-tight">Split<span className="text-blue-500">Ease</span></span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                  Client Docs
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Expense Splitting & Debt Simplification</p>
            </div>
          </Link>
        </div>

        {/* Global Search & Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input 
              type="text" 
              placeholder="Search architecture, algorithms, APIs..." 
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
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
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
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold sidebar-link ${
                        isActive ? 'active' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-500'} />
                      <span className="truncate">{sec.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Quick Links Card */}
            <div className="p-4 bg-gradient-to-br from-indigo-950/40 to-blue-950/20 border border-indigo-900/40 rounded-2xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-2">
                <Sparkles size={14} /> Production Live URL
              </div>
              <p className="text-[11px] text-slate-400 mb-3">SplitEase is deployed with 256-bit TLS HTTPS and automated CI/CD.</p>
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
          <div className="docs-card p-8 sm:p-10 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-indigo-950/30">
            <div className="max-w-3xl relative z-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold text-blue-400 mb-4">
                <Shield size={13} /> Production-Ready Architecture & Math Engine
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
                SplitEase Engineering & Client Documentation Portal
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
                SplitEase is an enterprise-grade, multi-tenant expense splitting and debt settlement platform. It optimizes multi-party financial graphs down to minimal direct payments, enforces zero floating-point arithmetic errors via integer-paisa math, guarantees audit trail tracking, and automates 7-day settlement reminders.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                  <div className="text-xl font-black text-blue-400">O(N log N)</div>
                  <div className="text-[11px] text-slate-400 font-medium">Debt Simplification</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                  <div className="text-xl font-black text-emerald-400">0.00%</div>
                  <div className="text-[11px] text-slate-400 font-medium">Floating Point Error</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                  <div className="text-xl font-black text-purple-400">256-bit</div>
                  <div className="text-[11px] text-slate-400 font-medium">TLS/HTTPS Security</div>
                </div>
                <div className="bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
                  <div className="text-xl font-black text-amber-400">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium">ACID Transactions</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Overview & Architecture */}
          <section id="overview" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">1. System Topology & Technology Stack</h2>
                <p className="text-xs text-slate-400">High-level architectural topology and full-stack runtime specification</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">System Architecture Topology</h3>
              
              {/* ASCII / Visual Flow Diagram */}
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

              {/* Technology Stack Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-900/90 text-slate-300 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="p-3 border-b border-slate-800">Layer</th>
                      <th className="p-3 border-b border-slate-800">Technology</th>
                      <th className="p-3 border-b border-slate-800">Key Responsibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-blue-400">Frontend UI</td>
                      <td className="p-3">React 18 + Vite + TypeScript</td>
                      <td className="p-3">Single Page Application, reactive state, responsive mobile/desktop layout.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-indigo-400">Styling & Motion</td>
                      <td className="p-3">TailwindCSS + Framer Motion</td>
                      <td className="p-3">Modern Electric Indigo design system, micro-animations, glassmorphism.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-emerald-400">Backend API</td>
                      <td className="p-3">Express 5.x + Node.js (ESM)</td>
                      <td className="p-3">REST API routes, validation pipelines, debt engine, cron scheduler.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-purple-400">Database & ORM</td>
                      <td className="p-3">PostgreSQL 16 + Prisma ORM</td>
                      <td className="p-3">Relational persistence, B-Tree index lookups, ACID database transactions.</td>
                    </tr>
                    <tr className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-amber-400">Authentication</td>
                      <td className="p-3">JWT + bcryptjs + httpOnly Cookies</td>
                      <td className="p-3">Stateless 1-hour access tokens with 7-day silent refresh rotation.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 2: Mathematical Debt Simplification Engine */}
          <section id="algorithm" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Cpu size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">2. Debt Simplification & Graph Algorithm Engine</h2>
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

              {/* Greedy Algorithm Steps */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">2. Greedy Min-Transfer Reduction Algorithm</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Without simplification, <code className="text-blue-400">N</code> people require up to <code className="text-blue-400">N(N - 1)</code> cross-transactions. SplitEase reduces this to at most <code className="text-emerald-400 font-bold">N - 1</code> direct transfers:
                </p>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 pl-2 font-medium">
                  <li>Divide members into sorted arrays: <code className="text-red-400 bg-slate-950 px-1 py-0.5 rounded">Debtors (B_i &lt; 0)</code> sorted ascending, and <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">Creditors (B_j &gt; 0)</code> sorted descending.</li>
                  <li>Greedily match the largest debtor with the largest creditor: <code className="text-indigo-400 font-mono">transfer = min(|B_debtor|, B_creditor)</code>.</li>
                  <li>Record direct transfer edge: <code className="text-indigo-300 font-mono">Debtor &rarr; Creditor (amount)</code>.</li>
                  <li>Deduct transferred amount from both balances. Advance pointers when a member reaches balance 0.</li>
                </ol>
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
                      💡 <strong>Optimization Efficiency:</strong> Reduced cross-payments down to optimal direct transfers with zero circular transactions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Zero Floating-Point Math */}
          <section id="precision" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">3. Zero Floating-Point Financial Precision</h2>
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
                  <p className="text-[11px] text-slate-400">
                    Storing decimals directly causes compounding binary rounding errors:
                  </p>
                  <div className="docs-code-block p-3 text-[11px] font-mono text-rose-300">
                    // JavaScript Floating Point Error<br/>
                    0.1 + 0.2 === 0.3 // false!<br/>
                    0.1 + 0.2 // 0.30000000000000004
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    &check; SplitEase Integer-Paisa Guarantee
                  </div>
                  <p className="text-[11px] text-slate-400">
                    PostgreSQL stores currency strictly as integers in Paisa (1 PKR = 100 Paisa):
                  </p>
                  <div className="docs-code-block p-3 text-[11px] font-mono text-emerald-300">
                    // Integer Paisa Arithmetic<br/>
                    rupeeToPaisa(150.50) // 15050 Paisa<br/>
                    paisaToRupee(15050)  // "150.50 PKR"
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Database ERD & Indexes */}
          <section id="database" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Database size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">4. Database Architecture & Relational ERD Models</h2>
                <p className="text-xs text-slate-400">PostgreSQL relational schema specification and high-concurrency B-Tree indexing</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* User Model */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span>User</span>
                    <span className="text-[10px] text-slate-500 font-mono">10 Relational Keys</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Stores user credentials, bcrypt password hashes, and receiving payment accounts.</p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                    <div>• <span className="text-indigo-400">id</span>: Int [PK]</div>
                    <div>• <span className="text-indigo-400">email</span>: String [Unique]</div>
                    <div>• <span className="text-indigo-400">passwordHash</span>: String</div>
                    <div>• <span className="text-indigo-400">paymentMethod</span>: String?</div>
                  </div>
                </div>

                {/* Group Model */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-blue-400 font-bold">
                    <span>Group</span>
                    <span className="text-[10px] text-slate-500 font-mono">Invite Code Indexed</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Multi-tenant expense group container with unique alphanumeric join codes.</p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                    <div>• <span className="text-indigo-400">id</span>: Int [PK]</div>
                    <div>• <span className="text-indigo-400">name</span>: String</div>
                    <div>• <span className="text-indigo-400">inviteCode</span>: String [Unique]</div>
                    <div>• <span className="text-indigo-400">createdById</span>: Int [Index]</div>
                  </div>
                </div>

                {/* Expense Model */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Expense & ExpensePayer</span>
                    <span className="text-[10px] text-slate-500 font-mono">Paisa Arithmetic</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Supports multi-payer contributions and uneven participant share splitting.</p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                    <div>• <span className="text-indigo-400">totalAmount</span>: Int (Paisa)</div>
                    <div>• <span className="text-indigo-400">groupId</span>: Int [Index]</div>
                    <div>• <span className="text-indigo-400">paidById</span>: Int [Index]</div>
                    <div>• <span className="text-indigo-400">payers</span>: ExpensePayer[]</div>
                  </div>
                </div>

                {/* Settlement Model */}
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Settlement & Proof</span>
                    <span className="text-[10px] text-slate-500 font-mono">Two-Way Handshake</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">Tracks direct debt repayments with screenshot verification proofs.</p>
                  <div className="text-[11px] font-mono text-slate-300 space-y-0.5">
                    <div>• <span className="text-indigo-400">amount</span>: Int (Paisa)</div>
                    <div>• <span className="text-indigo-400">status</span>: AWAITING | CONFIRMED</div>
                    <div>• <span className="text-indigo-400">screenshotUrl</span>: String?</div>
                    <div>• <span className="text-indigo-400">groupId, payerId, payeeId</span> [Indexed]</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Core Sequence Workflows */}
          <section id="workflows" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <GitBranch size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">5. Core System Sequence Workflows</h2>
                <p className="text-xs text-slate-400">End-to-end execution flows for authentication, expenses, settlements, and cron jobs</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-6">
              
              {/* Workflow 1: Token Lifecycle */}
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

              {/* Workflow 2: Settlement Verification */}
              <div className="space-y-2 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white">Workflow B: Debt Settlement & Payee Confirmation Handshake</h3>
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

          {/* Section 6: Security Architecture */}
          <section id="security" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">6. Enterprise Security & Defensive Hardening</h2>
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

          {/* Section 7: REST API Reference */}
          <section id="api" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Terminal size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">7. RESTful API Reference & OpenAPI Endpoints</h2>
                <p className="text-xs text-slate-400">Complete API catalog with sample JSON requests, headers, and responses</p>
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
                  {cat}
                </button>
              ))}
            </div>

            {/* Endpoints List */}
            <div className="space-y-4">
              {filteredEndpoints.map((ep, idx) => (
                <div key={idx} className="docs-card p-5 space-y-4">
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
                    <span className="text-xs text-slate-400 font-medium">{ep.summary}</span>
                  </div>

                  <p className="text-xs text-slate-300">{ep.desc}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5">
                        <span>Request Body</span>
                        <button 
                          onClick={() => copyToClipboard(ep.body, `req-${idx}`)}
                          className="hover:text-white flex items-center gap-1 text-[10px]"
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
                        <span>Response (200 OK)</span>
                        <button 
                          onClick={() => copyToClipboard(ep.response, `res-${idx}`)}
                          className="hover:text-white flex items-center gap-1 text-[10px]"
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

          {/* Section 8: AWS EC2 & CI/CD Deployment */}
          <section id="devops" className="space-y-6 scroll-mt-24">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Server size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">8. AWS EC2 Production & Automated CI/CD Blueprints</h2>
                <p className="text-xs text-slate-400">Cloud infrastructure topology, Nginx reverse proxy, PM2 process management, and GitHub Actions</p>
              </div>
            </div>

            <div className="docs-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <div className="font-bold text-white mb-1">AWS EC2 Server</div>
                  <p className="text-slate-400 text-[11px]">Ubuntu 24.04 LTS instance running in AWS us-east-1 with automated security patches.</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <div className="font-bold text-white mb-1">Nginx & Certbot SSL</div>
                  <p className="text-slate-400 text-[11px]">Terminates HTTPS on port 443, serves static Vite bundle, and proxies <code className="text-blue-400">/api/</code> to Express.</p>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
                  <div className="font-bold text-white mb-1">GitHub Actions CI/CD</div>
                  <p className="text-slate-400 text-[11px]">Every <code className="text-blue-400">git push origin main</code> runs automated builds and zero-downtime SSH deployments.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer CTA */}
          <div className="p-8 docs-card text-center space-y-4 bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900">
            <h3 className="text-xl font-black text-white">Ready to Explore SplitEase?</h3>
            <p className="text-xs text-slate-300 max-w-xl mx-auto">
              Experience algorithmic debt simplification and multi-tenant expense splitting live on our production deployment.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
              >
                Log In to Platform
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
