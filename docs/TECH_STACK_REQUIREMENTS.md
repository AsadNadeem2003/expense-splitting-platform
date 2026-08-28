# SplitEase — Complete Tech Stack & Requirements Specification

This document provides a comprehensive inventory of all technologies, runtimes, libraries, frameworks, database systems, and infrastructure tools utilized in the **SplitEase** platform, detailing their exact version, category, purpose, and architectural justification.

---

## 🛠️ 1. Backend Technology Stack

| Technology / Library | Version | Category | Purpose & Architectural Justification |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v20.x LTS` / `v22.x` | Runtime | Asynchronous, event-driven JavaScript/TypeScript server runtime for high I/O concurrency. Configured with native ES Modules (`"type": "module"`). |
| **TypeScript** | `v5.x` (`target: ES2022`) | Language | Enforces compile-time type safety, eliminating runtime `undefined` errors across balance math, models, and controllers. |
| **Express.js** | `v5.2.1` | Web Framework | Lightweight, high-throughput REST API framework providing robust routing, middleware chaining, and custom error handling. |
| **Prisma ORM** | `v5.22.0` | ORM / Query Builder | Type-safe database client with declarative schema modeling, connection pooling, automated migrations, and ACID `prisma.$transaction` rollback support. |
| **PostgreSQL** | `v16.x` | Relational Database | Enterprise ACID-compliant relational SQL database with relational constraints, foreign keys, and B-Tree indexes for fast debt graph traversals. |
| **Zod** | `v4.4.3` | Schema Validation | Runtime request body validation middleware ensuring strict type integrity before data reaches controllers. |
| **bcryptjs** | `v3.0.3` | Cryptography | One-way password hashing using Blowfish cipher with a salt round factor of 10. |
| **jsonwebtoken (JWT)** | `v9.0.3` | Authentication | Stateless access tokens (1-hour expiry) and cryptographic signing for user sessions. |
| **cookie-parser** | `v1.4.7` | Middleware | Parses `httpOnly` secure refresh cookies from incoming HTTP request headers. |
| **helmet** | `v8.3.0` | Security Middleware | Sets HTTP security response headers (`X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`, hides `X-Powered-By`). |
| **express-rate-limit** | `v8.6.2` | Security Middleware | In-memory IP rate limiting (300 req/15min globally, 10 req/15min auth, 20 req/15min group joins) preventing DoS and brute-force attacks. |
| **cors** | `v2.8.6` | Networking Security | Cross-Origin Resource Sharing middleware configured with dynamic whitelist checking and `credentials: true`. |
| **node-cron** | `v4.6.0` | Background Jobs | Pure JavaScript task scheduler executing the daily 9:00 AM 7-day debt reminder scanner. |
| **nodemailer** | `v9.0.3` | Email Service | Dispatches debt notification emails with automatic fallback to Ethereal test accounts and Resend API detection. |
| **multer** | `v2.2.0` | Multipart File Upload | Handles multipart form-data disk storage for payment receipts (`/uploads/settlements/`) with MIME type armor (JPEG/PNG/WebP, 5MB limit). |
| **swagger-ui-express & swagger-jsdoc** | `v5.0.1` / `v6.3.0` | API Documentation | Generates interactive OpenAPI 3.0 documentation mounted at `/api-docs` (auto-disabled in production). |
| **tsx** | `v4.23.1` | TypeScript Execution | Native TypeScript execution engine enabling seamless development (`tsx watch`) and production execution. |
| **dotenv** | `v17.4.2` | Configuration | Loads environment variables (`DATABASE_URL`, `JWT_SECRET`, `PORT`) into `process.env`. |

---

## 🎨 2. Frontend Technology Stack

| Technology / Library | Version | Category | Purpose & Architectural Justification |
| :--- | :--- | :--- | :--- |
| **React** | `v18.x` / `v19.x` | UI Library | Component-based reactive UI rendering with strict hooks lifecycle and concurrent rendering features. |
| **Vite** | `v8.1.x` | Build Tool & Bundler | Next-generation frontend bundler providing instant Hot Module Replacement (HMR) and optimized Rolldown production builds. |
| **TypeScript** | `v5.x` / `v6.x` | Language | Full end-to-end interface typing synced with backend schema responses. |
| **TailwindCSS** | `v3.4.19` | CSS Framework | Utility-first responsive design framework with customized design tokens, mesh gradients, glassmorphism, and responsive breakpoints. |
| **React Router DOM** | `v7.x` | Client-Side Routing | Declarative client routing (`/`, `/groups`, `/groups/:id`, `/activity`, `/settings`, `/docs`, `/login`, `/register`) with protected route guards. |
| **Axios** | `v1.18.1` | HTTP Client | Promise-based HTTP client with request interceptors (Bearer token attachment) and response interceptors (silent 401 token refresh). |
| **Framer Motion** | `v12.42.2` | Animation Engine | Smooth micro-animations, modal entrance/exit transitions (`AnimatePresence`), and interactive layout gestures. |
| **Lucide React** | `v1.24.0` | Iconography | Clean, consistent SVG icon set for financial and interface indicators. |
| **react-hot-toast** | `v2.6.0` | Notifications | Lightweight, customizable toast alert popups for mutations, copies, and errors. |
| **date-fns** | `v4.4.0` | Date Utilities | Format relative timestamps ("Just now", "2d ago", "Yesterday") and ISO date strings. |
| **Autoprefixer & PostCSS** | `v10.x` / `v8.x` | CSS Processing | Vendor prefixing and CSS transformation for maximum cross-browser compatibility. |

---

## ☁️ 3. DevOps, Cloud & Deployment Infrastructure

| Technology / Tool | Version / Spec | Purpose & Architectural Justification |
| :--- | :--- | :--- |
| **AWS EC2** | `t3.micro` / `t3.small` (Ubuntu 24.04 LTS) | Cloud virtual machine hosting backend API, PostgreSQL, and static web bundles. |
| **Nginx** | `v1.24+` | High-performance Reverse Proxy and static web server. Handles SSL termination, Gzip asset compression, and routes `/api/` to port 4000 and `/` to `/var/www/splitease/frontend/dist`. |
| **Let's Encrypt Certbot** | `v2.x` | Automated 256-bit TLS/SSL certificate issuance and auto-renewal for HTTPS encryption. |
| **PM2** | `v5.x` | Production Process Manager for Node.js. Manages auto-restarts, zero-downtime reloads, and background logging. |
| **GitHub Actions** | Automated CI/CD | Continuous Integration & Deployment pipeline executing on every `git push origin main`. Runs SSH deploy script to update codebase, rebuild frontend, push Prisma schema, and restart PM2. |
| **sslip.io Dynamic DNS** | Dynamic DNS | Maps EC2 Elastic IP `98.92.49.144` to `https://98.92.49.144.sslip.io` enabling full SSL certificate validation. |

---

## 📊 4. Database Schema Requirements (10 Core Models)

1. **`User`**: Core user accounts, bcrypt password hashes, structured receiving accounts (`paymentMethod`).
2. **`Group`**: Multi-tenant groups with unique invite codes and creator associations.
3. **`GroupMember`**: Group memberships with RBAC roles (`ADMIN`, `MEMBER`) and join timestamps.
4. **`GroupJoinRequest`**: Pending join requests requiring admin approval.
5. **`Expense`**: Parent expense records with total paisa amounts and primary payer.
6. **`ExpensePayer`**: Multi-payer contribution breakdown table.
7. **`ExpenseParticipant`**: Split participant share allocations table.
8. **`ExpenseEditHistory`**: Immutable change audit trail logging field modifications.
9. **`Settlement`**: Bilateral direct payment records with screenshot URLs and verification status (`AWAITING_VERIFICATION`, `CONFIRMED`, `REJECTED`).
10. **`SettlementReminderLog`**: 7-day cooldown reminder dispatch logs preventing notification spam.
