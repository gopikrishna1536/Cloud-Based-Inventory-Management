const bcrypt = require('bcryptjs');

// In-Memory Database Store Fallback when Atlas URI is not provided/offline
const store = {
  organizations: [
    {
      _id: 'org_abc_123',
      name: 'ABC Electronics',
      email: 'contact@abcelectronics.com',
      phone: '+91 98765 43210',
      address: '104 Tech Park, Whitefield, Bengaluru, KA 560066',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      plan: 'PRO',
      subscriptionStatus: 'ACTIVE',
      createdAt: new Date(),
    },
    {
      _id: 'org_xyz_456',
      name: 'XYZ Stores Ltd',
      email: 'contact@xyzstores.com',
      phone: '+91 88776 65544',
      plan: 'FREE',
      subscriptionStatus: 'ACTIVE',
      createdAt: new Date(),
    },
  ],

  users: [
    {
      _id: 'usr_admin_1',
      name: 'Sarah Connor',
      email: 'admin@abcelectronics.com',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      role: 'ADMIN',
      organizationId: 'org_abc_123',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
    {
      _id: 'usr_manager_1',
      name: 'John Doe',
      email: 'manager@abcelectronics.com',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      role: 'MANAGER',
      organizationId: 'org_abc_123',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
    {
      _id: 'usr_staff_1',
      name: 'Alice Smith',
      email: 'staff@abcelectronics.com',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      role: 'STAFF',
      organizationId: 'org_abc_123',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
    {
      _id: 'usr_tenantb_1',
      name: 'Tenant B Admin',
      email: 'admin@xyzstores.com',
      passwordHash: bcrypt.hashSync('Password123!', 10),
      role: 'ADMIN',
      organizationId: 'org_xyz_456',
      status: 'ACTIVE',
      createdAt: new Date(),
    },
  ],

  categories: [
    { _id: 'cat_1', name: 'Laptops & Computers', description: 'Desktops, ultrabooks, workstations', organizationId: 'org_abc_123' },
    { _id: 'cat_2', name: 'Mobile Devices', description: 'Smartphones, tablets, smartwatches', organizationId: 'org_abc_123' },
    { _id: 'cat_3', name: 'Peripherals', description: 'Mice, mechanical keyboards, monitors', organizationId: 'org_abc_123' },
    { _id: 'cat_4', name: 'Audio & Video', description: 'Headphones, Bluetooth speakers', organizationId: 'org_abc_123' },
    { _id: 'cat_5', name: 'Storage & Accessories', description: 'SSDs, external drives, hubs', organizationId: 'org_abc_123' },
  ],

  suppliers: [
    { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd', email: 'sales@techdistro.in', phone: '+91 80 4455 6677', address: 'MG Road, Bengaluru', gstNumber: '29ABCDE1234F1Z5', organizationId: 'org_abc_123' },
    { _id: 'sup_2', name: 'Anil Mehta', company: 'Silicon Component Traders', email: 'orders@siliconcomp.com', phone: '+91 22 8899 0011', address: 'Andheri East, Mumbai', gstNumber: '27GHIJK5678L1Z9', organizationId: 'org_abc_123' },
    { _id: 'sup_3', name: 'David Miller', company: 'Global Micro Systems', email: 'contact@globalmicro.io', phone: '+1 408 555 0199', address: 'San Jose, CA, USA', gstNumber: 'FOREIGN_EXP_99', organizationId: 'org_abc_123' },
  ],

  products: [
    { _id: 'prod_1', name: 'Dell XPS 13 Laptop', sku: 'LAP001', description: 'Intel i7 13th Gen, 16GB RAM, 512GB SSD', categoryId: { _id: 'cat_1', name: 'Laptops & Computers' }, supplierId: { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd' }, organizationId: 'org_abc_123', purchasePrice: 85000, sellingPrice: 105000, stock: 12, reorderLevel: 5, maxStock: 25, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', createdAt: new Date() },
    { _id: 'prod_2', name: 'MacBook Pro 14" M3', sku: 'LAP002', description: 'Apple M3 chip, 18GB RAM, 512GB SSD', categoryId: { _id: 'cat_1', name: 'Laptops & Computers' }, supplierId: { _id: 'sup_3', name: 'David Miller', company: 'Global Micro Systems' }, organizationId: 'org_abc_123', purchasePrice: 145000, sellingPrice: 169900, stock: 8, reorderLevel: 3, maxStock: 15, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', createdAt: new Date() },
    { _id: 'prod_3', name: 'Samsung Galaxy S24 Ultra', sku: 'MOB001', description: '512GB Titanium Gray 12GB RAM', categoryId: { _id: 'cat_2', name: 'Mobile Devices' }, supplierId: { _id: 'sup_2', name: 'Anil Mehta', company: 'Silicon Component Traders' }, organizationId: 'org_abc_123', purchasePrice: 98000, sellingPrice: 119999, stock: 15, reorderLevel: 6, maxStock: 30, image: '', createdAt: new Date() },
    { _id: 'prod_4', name: 'iPhone 15 Pro Max', sku: 'MOB002', description: '256GB Natural Titanium', categoryId: { _id: 'cat_2', name: 'Mobile Devices' }, supplierId: { _id: 'sup_3', name: 'David Miller', company: 'Global Micro Systems' }, organizationId: 'org_abc_123', purchasePrice: 115000, sellingPrice: 134900, stock: 4, reorderLevel: 5, maxStock: 20, image: '', createdAt: new Date() },
    { _id: 'prod_5', name: 'Logitech MX Master 3S Mouse', sku: 'MOU001', description: 'Ergonomic wireless mouse with quiet clicks', categoryId: { _id: 'cat_3', name: 'Peripherals' }, supplierId: { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd' }, organizationId: 'org_abc_123', purchasePrice: 6500, sellingPrice: 8995, stock: 35, reorderLevel: 10, maxStock: 60, image: '', createdAt: new Date() },
    { _id: 'prod_6', name: 'Keychron K2 Mechanical Keyboard', sku: 'KEY001', description: 'Wireless Bluetooth RGB Gaming Keyboard', categoryId: { _id: 'cat_3', name: 'Peripherals' }, supplierId: { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd' }, organizationId: 'org_abc_123', purchasePrice: 5200, sellingPrice: 7499, stock: 3, reorderLevel: 10, maxStock: 40, image: '', createdAt: new Date() },
    { _id: 'prod_7', name: 'Bose SoundLink Flex Speaker', sku: 'AUD002', description: 'Portable Bluetooth Waterproof Speaker', categoryId: { _id: 'cat_4', name: 'Audio & Video' }, supplierId: { _id: 'sup_2', name: 'Anil Mehta', company: 'Silicon Component Traders' }, organizationId: 'org_abc_123', purchasePrice: 11000, sellingPrice: 14900, stock: 0, reorderLevel: 5, maxStock: 25, image: '', createdAt: new Date() },
  ],

  purchases: [
    {
      _id: 'pur_1',
      supplierId: { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd' },
      organizationId: 'org_abc_123',
      items: [
        { productId: { _id: 'prod_1', name: 'Dell XPS 13 Laptop', sku: 'LAP001' }, quantity: 10, purchasePrice: 85000, total: 850000 },
      ],
      totalAmount: 850000,
      createdBy: { _id: 'usr_admin_1', name: 'Sarah Connor' },
      createdAt: new Date(),
    },
  ],

  sales: [
    {
      _id: 'sale_1',
      customer: { name: 'Metro Retail Store', phone: '+91 99887 11223', email: 'procurement@metro.com' },
      organizationId: 'org_abc_123',
      items: [
        { productId: { _id: 'prod_1', name: 'Dell XPS 13 Laptop', sku: 'LAP001' }, quantity: 2, sellingPrice: 105000, purchasePrice: 85000, total: 210000, profit: 40000 },
      ],
      subtotal: 210000,
      discount: 0,
      tax: 37800,
      totalAmount: 247800,
      totalProfit: 40000,
      createdBy: { _id: 'usr_staff_1', name: 'Alice Smith' },
      createdAt: new Date(),
    },
  ],

  transactions: [],
  subscriptions: [
    { _id: 'sub_1', organizationId: 'org_abc_123', plan: 'PRO', status: 'ACTIVE', startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    { _id: 'sub_2', organizationId: 'org_xyz_456', plan: 'FREE', status: 'ACTIVE', startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  ],
};

module.exports = store;
