# SplitEase — Enterprise Expense Splitting & Debt Settlement Platform

[![Production Deployment](https://img.shields.io/badge/Production-Live%20HTTPS-emerald?style=for-the-badge&logo=nginx)](https://98.92.49.144.sslip.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.x-slate?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

**SplitEase** is an enterprise-grade, multi-tenant expense splitting and financial management platform designed for roommates, trip groups, and collaborative teams. It optimizes multi-party cross-debts using an algorithmic graph reduction engine, enforces strict financial precision using zero floating-point integer-paisa arithmetic, tracks immutable audit histories, and automates 7-day debt reminder notifications via background cron jobs and email delivery.

🌐 **Live Production Deployment**: [https://98.92.49.144.sslip.io](https://98.92.49.144.sslip.io)  
📚 **Interactive Client Documentation Portal**: [https://98.92.49.144.sslip.io/docs](https://98.92.49.144.sslip.io/docs)

---

## 🌟 Key Features

### 1. 🧠 Algorithmic Debt Simplification ($O(N \log N)$ Graph Reduction)
- Calculates true net balances using the Conservation Invariant: $\sum_{i=1}^N B_i = 0$.
- Collapses redundant cross-payments from $N(N-1)$ down to at most $N-1$ optimal direct transfers using a greedy matching algorithm.
- Interactive live debt playground available in the Client Documentation Portal.

### 2. 💎 Zero Floating-Point Error (Integer-Paisa Financial Arithmetic)
- Stored exclusively in PostgreSQL as **Integers in Paisa** ($1 \text{ PKR} = 100 \text{ Paisa}$).
- Eliminates binary floating-point rounding errors (e.g. `0.1 + 0.2 != 0.3`).

### 3. 🧾 Multi-Payer Shared Expenses & Audit Trails
- Supports single payer or multiple payers splitting expenses equally or with custom shares.
- Full immutable audit history tracking (`ExpenseEditHistory`) for changes made to bills.

### 4. 💳 Two-Way Proof-Backed Settlement Flow
- Users configure structured payment receiving accounts in Settings (**EasyPaisa**, **JazzCash**, **Raast ID**, **Nayapay**, **Sadapay**, or **Bank IBAN**).
- Settle-up modal automatically populates recipient verified accounts with a 1-click **Copy Account** button.
- Debtor attaches proof receipt screenshots; payee verifies and confirms in 1 click.
- **Duplicate Settlement Guard**: Prevents accidental double-payments.

### 5. 🔔 Real-Time Notification Popover & Member Discovery
- Top navbar bell icon with 15s live polling for debt nudges, settlement verification requests, and group join requests.
- **1-Click WhatsApp Sharing & Direct Links**: Groups support 1-click WhatsApp message sharing (`https://wa.me/?text=...`) and direct invite links (`/login?inviteCode=...`) with seamless auto-join.
- **Privacy-Compliant Targeted Search**: Requires $\ge 2$ characters to protect platform privacy while allowing instant 1-click member adding.

### 6. ⏰ Automated 7-Day Settlement Reminders & Nudges
- Daily 9:00 AM `node-cron` background job scans for unsettled debts older than 7 days and dispatches email notifications.
- Strict 7-day cooldown per debtor/creditor pair to prevent notification spam.

### 7. 🛡️ Enterprise Security & Hardening
- 256-bit TLS/HTTPS encryption with Let's Encrypt Certbot.
- Global security headers (`helmet`) and 3-tier rate limiters (`express-rate-limit`).
- Stateless 1-hour JWTs with 7-day `httpOnly`, `SameSite: strict` refresh cookies.
- Group-level Role-Based Access Control (`groupAccessMiddleware`).

---

## 🏗️ System Architecture Topology

```
+-----------------------------------------------------------------------------------+
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
+-----------------------------------------------------------------------------------+
```

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+ or v20+)
- PostgreSQL running on port 5432

### 1. Backend Setup
```bash
cd backend
npm install
# Push database schema to PostgreSQL
npx prisma db push
npm run dev
```
- Server starts on `http://localhost:4000`.
- OpenAPI / Swagger UI: `http://localhost:4000/api-docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Client starts on `http://localhost:5173`.

---

## 🚀 AWS EC2 Production & CI/CD Pipeline
- **Server**: AWS EC2 `t3.micro` / `t3.small` (Ubuntu 24.04 LTS).
- **Web Server / Reverse Proxy**: Nginx routing `/` to `frontend/dist` and `/api/` to `http://127.0.0.1:4000`.
- **Process Manager**: PM2 running Node.js backend (`pm2 start "npx tsx src/index.ts" --name "splitease-api"`).
- **Automated CI/CD**: GitHub Actions workflow ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)) automatically deploys on every `git push origin main`.

---

## 📄 License
This project is licensed under the MIT License.
