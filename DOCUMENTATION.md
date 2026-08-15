# Academic Project Documentation
## Cloud-Based Inventory Management System (StockCloud)

**Degree Program**: Bachelor of Technology (B.Tech) in Computer Science & Engineering  
**Project Title**: Cloud-Based Inventory Management System  
**Architecture**: Multi-Tenant Software-as-a-Service (SaaS)  
**Database**: MongoDB Atlas Cloud Database  

---

## 1. ABSTRACT

In modern supply chain management, traditional manual inventory control methods lead to stock inaccuracies, overstocking, stockouts, and delayed decision-making. This project presents **StockCloud**, a comprehensive cloud-based multi-tenant Software-as-a-Service (SaaS) inventory management web application. 

Built using the MERN stack (MongoDB Atlas, Express.js, React.js, Node.js) with Vite, Tailwind CSS, Recharts, and JWT authentication, StockCloud enables small-to-medium enterprises (SMEs) and retail organizations to manage products, categories, suppliers, purchase orders, customer sales, team access roles, and financial analytics from a unified web interface. 

The application implements tenant data isolation using backend organization scoping, ensuring complete privacy across multiple enterprise subscribers. Automated stock transactions automatically update inventory upon purchase or sale confirmation while generating low-stock alert warnings and real-time profit reports.

---

## 2. PROBLEM STATEMENT

Small and medium-sized retail businesses face severe operational bottlenecks due to reliance on legacy inventory tracking methods:
1. **Manual Data Entry Errors**: Paper ledgers and static spreadsheets (Microsoft Excel) suffer from human transcription errors.
2. **Lack of Real-Time Visibility**: Stock levels are updated retroactively, making it impossible to ascertain instantaneous stock availability during sales transactions.
3. **Unplanned Stockouts & Overstocking**: Without automated reorder threshold warnings, businesses frequently run out of high-demand items or tie up capital in excess stock.
4. **Data Isolation Insecurity**: On-premise spreadsheet databases lack multi-user role permissions, leading to unauthorized record modifications.
5. **High Software Licensing Costs**: Traditional enterprise resource planning (ERP) systems require expensive server infrastructure and dedicated IT personnel.

---

## 3. PROJECT OBJECTIVES

1. **Develop a Multi-Tenant SaaS Platform**: Allow multiple distinct organizations to register and use a single centralized cloud web application with total data isolation.
2. **Implement MongoDB Atlas Integration**: Store application data on a scalable, cloud-hosted MongoDB Atlas cluster.
3. **Automate Inventory Movements**: Ensure that confirming a supplier purchase order automatically increments stock (`stock += quantity`), while completing a customer sale automatically validates stock availability and decrements stock (`stock -= quantity`).
4. **Enforce Role-Based Access Control (RBAC)**: Restrict feature access across three distinct user roles (`ADMIN`, `MANAGER`, `STAFF`).
5. **Provide Financial & Operational Analytics**: Compute real-time inventory cost valuation, gross profit margins, today's sales, monthly trends using interactive Recharts charts, and export filterable CSV reports.
6. **Enforce Subscription Tier Limits**: Implement mock SaaS billing plans (`FREE`, `PRO`, `ENTERPRISE`) with strict enforcement of product catalog and team seat capacity limits.

---

## 4. EXISTING SYSTEM vs PROPOSED SYSTEM

### 4.1 Existing System (Legacy Manual & Excel Tracking)
- **Data Storage**: Local spreadsheets, physical logbooks.
- **Accessibility**: Tied to a single desktop workstation.
- **Stock Updates**: Manual manual reconciliation at the end of the day/week.
- **Security**: Basic password on file; no granular role permissions.
- **Cost Analysis**: Manual formula calculations prone to corruption.

### 4.2 Proposed System (StockCloud SaaS Solution)
- **Data Storage**: High-availability MongoDB Atlas cloud database.
- **Accessibility**: 24/7 web access across desktop, laptop, tablet, and mobile devices.
- **Stock Updates**: Real-time automated transaction processing with audit logging (`PURCHASE`, `SALE`, `ADJUSTMENT`, `RETURN`).
- **Security**: Bcrypt password hashing, JWT stateless authentication, strict tenant isolation middleware, and RBAC authorization.
- **Cost Analysis**: Instant profit margin calculations: `Profit = (sellingPrice - purchasePrice) * quantity`.

---

## 5. FUNCTIONAL REQUIREMENTS

1. **Authentication & Registration**:
   - Organization self-registration (Company Name, Admin Name, Email, Password).
   - JWT token issuance with 30-day expiration.
   - UI password recovery and reset.
2. **Product Management**:
   - Complete CRUD operations for products with unique organizational SKU codes.
   - Reorder level thresholds, cost prices, retail prices, category, and supplier associations.
3. **Category & Supplier Management**:
   - Product categorization with tenant scoping.
   - Supplier directory storing contact info, GST tax registration numbers, and order history logs.
4. **Purchases Module**:
   - Multi-item supplier purchase orders.
   - Automated product stock incrementation upon order placement.
5. **Sales & Billing Module**:
   - Multi-item sales form with customer details.
   - Real-time stock availability check; rejects order if requested quantity exceeds current stock.
   - Printable customer invoices with tax and discount adjustments.
6. **Low Stock Alert System**:
   - Real-time navbar notification badge and dashboard warning banner for products where `stock <= reorderLevel`.
7. **Reports & Analytics**:
   - Dashboard KPI cards and Recharts visual analytics (Sales vs Purchases, Category Breakdown, Top Selling Products).
   - Downloadable CSV reports for Sales, Purchases, and Inventory Valuation.
8. **Subscription & User Administration**:
   - Team member invitation with role assignment (`ADMIN`, `MANAGER`, `STAFF`).
   - Mock tier upgrades (`FREE` 50 products/2 users, `PRO` 500 products/10 users, `ENTERPRISE` unlimited).

---

## 6. NON-FUNCTIONAL REQUIREMENTS

1. **Security**:
   - Password encryption using `bcryptjs` with salt factor 10.
   - Backend tenant validation (`req.user.organizationId`) on all endpoints.
   - Sanitized input queries preventing NoSQL injection.
2. **Scalability**:
   - Stateless JWT authentication allowing horizontal API server scaling.
   - MongoDB Atlas indexing on `{ organizationId: 1, sku: 1 }`.
3. **Availability**:
   - MongoDB Atlas multi-region replication ensuring 99.99% database uptime.
4. **Performance**:
   - Fast page loads powered by Vite bundling and React 18 component caching.
   - API response times under 100ms for standard database queries.
5. **Usability**:
   - Modern glassmorphic dark-mode interface built with Tailwind CSS.
   - Fully responsive design accommodating desktop and mobile viewports.

---

## 7. SYSTEM ARCHITECTURE

```text
                               +-----------------------------+
                               |        CLIENT LAYER         |
                               |   React 18 + Vite Frontend  |
                               | (Tailwind CSS + Recharts)   |
                               +--------------+--------------+
                                              |
                                     HTTP REST / JSON API
                                              |
                                              v
                               +-----------------------------+
                               |       APPLICATION LAYER     |
                               |   Node.js + Express API     |
                               |                             |
                               |  +-----------------------+  |
                               |  | JWT Auth Middleware   |  |
                               |  +-----------------------+  |
                               |  | Multi-Tenant Scoping  |  |
                               |  +-----------------------+  |
                               |  | RBAC Middleware       |  |
                               |  +-----------------------+  |
                               +--------------+--------------+
                                              |
                                     Mongoose Driver
                                              |
                                              v
                               +-----------------------------+
                               |        DATABASE LAYER       |
                               |   MongoDB Atlas Cloud DB    |
                               |  (inventory_management DB)  |
                               +-----------------------------+
```

---

## 8. SAAS MULTI-TENANCY ARCHITECTURE

```text
                          StockCloud SaaS Cloud Platform
                                         |
            +----------------------------+----------------------------+
            |                            |                            |
    Tenant Organization A       Tenant Organization B       Tenant Organization C
     (e.g., ABC Electronics)      (e.g., XYZ Stores)        (e.g., Global Tech)
            |                            |                            |
    +-------+-------+            +-------+-------+            +-------+-------+
    | Products      |            | Products      |            | Products      |
    | Suppliers     |            | Suppliers     |            | Suppliers     |
    | Sales         |            | Sales         |            | Sales         |
    | Purchases     |            | Purchases     |            | Purchases     |
    +---------------+            +---------------+            +---------------+
            \                            |                            /
             \                           |                           /
              +--------------------------+--------------------------+
                                         |
                                         v
                         MongoDB Atlas Cloud Database
                     (Isolated by organizationId Field)
```

---

## 9. FUTURE ENHANCEMENTS

1. **AI-Powered Demand Forecasting**: Machine learning algorithms to predict upcoming seasonal product demand based on historical sales velocity.
2. **Barcode & QR Code Scanner**: Native device camera integration for instant product lookup and stock intake scanning.
3. **Automated WhatsApp & Email Notifications**: Automatic low-stock alerts sent directly to store managers via WhatsApp Business API and SendGrid.
4. **Real Payment Gateway Integration**: Razorpay and Stripe integration for live SaaS subscription billing.
5. **Mobile Application**: Native iOS & Android companion apps built with React Native.
