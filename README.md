# Expense Splitting Platform

A full-stack web application designed to help groups of friends, roommates, and travelers split expenses fairly and efficiently. 

## 🚀 Features
- **Group Management**: Create groups, invite users via shareable links, and manage members.
- **Advanced Expense Splitting**: Split bills equally among all members, or select specific participants. Supports multiple payers for a single bill.
- **Settlements**: Settle up debts with a single click.
- **Global Balances**: Advanced algorithm to calculate your true net cash flow across all your groups.
- **Audit Trails**: Full history tracking for when expenses are edited or changed.

## 🏗️ Project Architecture (Monorepo)

This repository is split into two fully decoupled environments:

* **`frontend/`**: The client-side application built with React, Vite, and TailwindCSS.
* **`backend/`**: The server-side API built with Node.js, Express, and PostgreSQL (via Prisma).

## 💻 How to Run Locally

Because the frontend and backend are decoupled, you will need to run them in two separate terminal windows.

### 1. Start the Backend
Open your first terminal and navigate to the backend folder:
```bash
cd backend
npm install
npm run dev
```
*(Note: See `backend/README.md` for database configuration and environment variables).*

### 2. Start the Frontend
Open your second terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

---
*Developed by Asad Nadeem.*
