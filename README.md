# Cloud-Based Inventory Management System (StockCloud)

A production-grade, multi-tenant Software-as-a-Service (SaaS) web application built for modern business inventory, sales, purchase management, and analytics with MongoDB Atlas cloud database support.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Vite-cyan.svg)
![Multi--Tenancy](https://img.shields.io/badge/SaaS-Multi--Tenant-purple.svg)

---

## Table of Contents

- [Overview](#overview)
- [Key Features & SaaS Concepts](#key-features--saas-concepts)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Multi-Tenancy & Security](#multi-tenancy--security)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Database Models](#database-models)
- [Installation & Local Setup](#installation--local-setup)
- [MongoDB Atlas Setup Guide](#mongodb-atlas-setup-guide)
- [Demo Credentials](#demo-credentials)
- [API Documentation](#api-documentation)
- [Testing & Verification](#testing--verification)
- [Cloud Deployment Guide](#cloud-deployment-guide)

---

## Overview

**StockCloud** is a cloud-native SaaS inventory platform designed to automate stock control, supplier purchases, customer billing sales, low-stock warnings, and financial profit calculations. It features strict multi-tenant isolation so multiple organizations can use the platform securely without data leakage.

### Academic Context
Developed as a B.Tech Computer Science Capstone Project demonstrating **Cloud Computing**, **Multi-Tenancy**, **MongoDB Atlas**, **JWT Authentication**, **Role-Based Access Control (RBAC)**, **Financial Aggregations**, and **Modern React Web Architecture**.

---

## Key Features & SaaS Concepts

1. **Multi-Tenant SaaS Architecture**: Strict organizational data isolation using backend `req.user.organizationId` scoping.
2. **MongoDB Atlas Database**: Cloud document storage using Mongoose schemas and index-level uniqueness.
3. **Role-Based Access Control**:
   - `ADMIN`: Full access (Products, Inventory, Sales, Purchases, Users, Subscriptions, Settings).
   - `MANAGER`: Operational access (Products, Categories, Suppliers, Inventory, Purchases, Sales, Reports).
   - `STAFF`: Point-of-Sale access (View Products & Inventory, Create Customer Sales).
4. **Real-time Inventory & Stock Transactions**: Automatic stock increment on purchase orders, stock decrement on sales, and manual adjustment audit logging (`PURCHASE`, `SALE`, `ADJUSTMENT`, `RETURN`).
5. **Low Stock Notifications**: Automated alert badge and dashboard warnings when `stock <= reorderLevel`.
6. **Automated Profit & Tax Calculations**: Real-time gross profit margin calculation per sale: `Profit = (sellingPrice - purchasePrice) * quantity`.
7. **Filterable Reports & CSV Export**: Downloadable CSV reports for Sales, Purchases, and Inventory Valuation.
8. **Mock SaaS Subscription System**: Free (50 Products, 2 Users), Pro (500 Products, 10 Users), Enterprise (Unlimited) plan enforcement.

---

## Architecture & Tech Stack

```text
                  USERS (Web Browser)
                           |
                           v
              React 18 + Vite + Tailwind CSS
                           |
                     REST API (Axios)
                           |
                           v
              Express.js + Node.js Backend
                           |
              JWT Auth & Tenant Isolation Middleware
                           |
                           v
            MongoDB Atlas Cloud Database (Mongoose)
```

### Stack Details
- **Frontend**: React 18, Vite, React Router DOM v6, Tailwind CSS, Recharts, Lucide React, Axios.
- **Backend**: Node.js, Express.js, Mongoose, JWT (jsonwebtoken), bcryptjs, CORS, dotenv.
- **Database**: MongoDB Atlas (`inventory_management` collection).

---

## Multi-Tenancy & Security

Tenant data security is enforced at the backend middleware layer:
- `req.user.organizationId` is injected into every database query.
- Client-submitted `organizationId` fields in `req.body` or `req.params` are explicitly ignored to eliminate cross-tenant data tampering.
- Passwords hashed with `bcryptjs` (salt factor 10).

---

## Database Models

- `Organization`: Company profile, plan tier (`FREE`/`PRO`/`ENTERPRISE`), subscription dates, currency.
- `User`: Name, email, hashed password, role (`ADMIN`/`MANAGER`/`STAFF`), `organizationId`, status.
- `Category`: Category name, description, `organizationId`.
- `Supplier`: Name, company, email, phone, address, GST number, `organizationId`.
- `Product`: Name, unique SKU per org, `categoryId`, `supplierId`, `organizationId`, prices, stock, reorder level.
- `Purchase`: Supplier order details, multi-item array, total cost, `createdBy`, `organizationId`.
- `Sale`: Customer info, multi-item array, subtotal, tax, discount, total amount, net profit, `createdBy`.
- `InventoryTransaction`: Audit log of stock movements (`type`, `quantity`, `previousStock`, `newStock`, `referenceId`).
- `Subscription`: Billing plan state and usage limits.

---

## Installation & Local Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas Account or local MongoDB server instance

### 1. Clone Project & Setup Backend
```bash
cd "c:/Users/gopik/Downloads/cloud project/backend"

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/inventory_management?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

### 2. Seed Demo Database
```bash
npm run seed
```

### 3. Setup Frontend
```bash
cd "../frontend"

# Install dependencies
npm install
```

### 4. Run Development Servers
Start Backend API (Port 5000):
```bash
cd "../backend"
npm run dev
```

Start Frontend App (Port 5173):
```bash
cd "../frontend"
npm run dev
```

Open browser at `http://localhost:5173`.

---

## Demo Credentials

You can log in with pre-seeded test accounts:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@abcelectronics.com` | `Password123!` | Full control, User management, Subscription, Settings |
| **Manager** | `manager@abcelectronics.com` | `Password123!` | Products, Categories, Suppliers, Purchases, Sales, Reports |
| **Staff** | `staff@abcelectronics.com` | `Password123!` | View Inventory & Products, Create Sales |
| **Tenant B Admin** | `admin@xyzstores.com` | `Password123!` | Multi-tenancy isolation validation account |

---

## API Documentation

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new organization & Admin account |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user profile & org details |
| `GET` | `/api/products` | All Roles | Fetch paginated products with search & filters |
| `POST` | `/api/products` | Admin, Manager | Add new product (validates plan limits) |
| `PUT` | `/api/products/:id` | Admin, Manager | Edit product details |
| `DELETE`| `/api/products/:id` | Admin, Manager | Remove product |
| `GET` | `/api/inventory` | All Roles | Stock overview & valuation summary |
| `POST` | `/api/inventory/adjust`| Admin, Manager | Manual stock adjustment or return audit |
| `POST` | `/api/purchases` | Admin, Manager | Create supplier order (increments stock) |
| `POST` | `/api/sales` | All Roles | Create customer sale (decrements stock & logs profit) |
| `GET` | `/api/reports/sales` | Admin, Manager | Sales revenue & profit aggregations |
| `GET` | `/api/reports/inventory`| Admin, Manager | Inventory cost vs retail valuation report |
| `GET` | `/api/users` | Admin Only | Manage team members |
| `PUT` | `/api/subscription` | Admin Only | Upgrade / downgrade SaaS tier |

---

## Testing & Verification

1. **Multi-Tenancy Isolation Test**:
   - Log in as `admin@abcelectronics.com` and add a unique product "Super Laptop".
   - Log out and log in as `admin@xyzstores.com`.
   - Verify that "Super Laptop" is completely invisible in `XYZ Stores`.
2. **Stock Flow Test**:
   - Create a Purchase Order for 10 units of a product -> Stock increases by 10.
   - Create a Sale for 4 units -> Stock decreases by 4, profit recorded.
3. **Plan Limit Enforcement Test**:
   - On `FREE` plan (50 products max), attempting to create the 51st product returns a `403 Forbidden` plan limit error.

---

## Cloud Deployment Guide

### Frontend Deployment (Vercel / Netlify)
1. Push `frontend` to GitHub repository.
2. Connect to Vercel, set build command `npm run build` and output directory `dist`.
3. Set environment variable `VITE_API_URL=https://your-backend-api.onrender.com/api`.

### Backend Deployment (Render / AWS EC2)
1. Push `backend` to GitHub.
2. Deploy as a Web Service on Render or Node environment on AWS EC2.
3. Configure environment variables in dashboard: `MONGODB_URI`, `JWT_SECRET`, `PORT`, `CLIENT_URL`.
