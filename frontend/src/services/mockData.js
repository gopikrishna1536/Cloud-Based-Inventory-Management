// Frontend Fallback Mock Data Store for Netlify & Offline Static Deployments
export const demoUsers = [
  {
    _id: 'usr_admin_1',
    name: 'Sarah Connor',
    email: 'admin@abcelectronics.com',
    role: 'ADMIN',
    organization: {
      _id: 'org_abc_123',
      name: 'ABC Electronics',
      plan: 'PRO',
    },
  },
  {
    _id: 'usr_manager_1',
    name: 'John Doe',
    email: 'manager@abcelectronics.com',
    role: 'MANAGER',
    organization: {
      _id: 'org_abc_123',
      name: 'ABC Electronics',
      plan: 'PRO',
    },
  },
  {
    _id: 'usr_staff_1',
    name: 'Alice Smith',
    email: 'staff@abcelectronics.com',
    role: 'STAFF',
    organization: {
      _id: 'org_abc_123',
      name: 'ABC Electronics',
      plan: 'PRO',
    },
  },
  {
    _id: 'usr_tenantb_1',
    name: 'Tenant B Admin',
    email: 'admin@xyzstores.com',
    role: 'ADMIN',
    organization: {
      _id: 'org_xyz_456',
      name: 'XYZ Stores Ltd',
      plan: 'FREE',
    },
  },
];

export const mockProducts = [
  { _id: 'prod_1', name: 'Dell XPS 13 Laptop', sku: 'LAP001', barcode: '8901234567891', description: 'Intel i7 13th Gen, 16GB RAM, 512GB SSD', categoryId: { _id: 'cat_1', name: 'Laptops & Computers' }, supplierId: { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd' }, organizationId: 'org_abc_123', purchasePrice: 85000, sellingPrice: 105000, stock: 12, reorderLevel: 5, maxStock: 25, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', createdAt: new Date() },
  { _id: 'prod_2', name: 'MacBook Pro 14" M3', sku: 'LAP002', barcode: '8901234567892', description: 'Apple M3 chip, 18GB RAM, 512GB SSD', categoryId: { _id: 'cat_1', name: 'Laptops & Computers' }, supplierId: { _id: 'sup_3', name: 'David Miller', company: 'Global Micro Systems' }, organizationId: 'org_abc_123', purchasePrice: 145000, sellingPrice: 169900, stock: 8, reorderLevel: 3, maxStock: 15, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', createdAt: new Date() },
  { _id: 'prod_3', name: 'Samsung Galaxy S24 Ultra', sku: 'MOB001', barcode: '8901234567893', description: '512GB Titanium Gray 12GB RAM', categoryId: { _id: 'cat_2', name: 'Mobile Devices' }, supplierId: { _id: 'sup_2', name: 'Anil Mehta', company: 'Silicon Component Traders' }, organizationId: 'org_abc_123', purchasePrice: 98000, sellingPrice: 119999, stock: 15, reorderLevel: 6, maxStock: 30, image: '', createdAt: new Date() },
  { _id: 'prod_4', name: 'iPhone 15 Pro Max', sku: 'MOB002', barcode: '8901234567894', description: '256GB Natural Titanium', categoryId: { _id: 'cat_2', name: 'Mobile Devices' }, supplierId: { _id: 'sup_3', name: 'David Miller', company: 'Global Micro Systems' }, organizationId: 'org_abc_123', purchasePrice: 115000, sellingPrice: 134900, stock: 4, reorderLevel: 5, maxStock: 20, image: '', createdAt: new Date() },
  { _id: 'prod_5', name: 'Logitech MX Master 3S Mouse', sku: 'MOU001', barcode: '8901234567895', description: 'Ergonomic wireless mouse with quiet clicks', categoryId: { _id: 'cat_3', name: 'Peripherals' }, supplierId: { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd' }, organizationId: 'org_abc_123', purchasePrice: 6500, sellingPrice: 8995, stock: 35, reorderLevel: 10, maxStock: 60, image: '', createdAt: new Date() },
  { _id: 'prod_6', name: 'Keychron K2 Mechanical Keyboard', sku: 'KEY001', barcode: '8901234567896', description: 'Wireless Bluetooth RGB Gaming Keyboard', categoryId: { _id: 'cat_3', name: 'Peripherals' }, supplierId: { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd' }, organizationId: 'org_abc_123', purchasePrice: 5200, sellingPrice: 7499, stock: 3, reorderLevel: 10, maxStock: 40, image: '', createdAt: new Date() },
  { _id: 'prod_7', name: 'Bose SoundLink Flex Speaker', sku: 'AUD002', barcode: '8901234567897', description: 'Portable Bluetooth Waterproof Speaker', categoryId: { _id: 'cat_4', name: 'Audio & Video' }, supplierId: { _id: 'sup_2', name: 'Anil Mehta', company: 'Silicon Component Traders' }, organizationId: 'org_abc_123', purchasePrice: 11000, sellingPrice: 14900, stock: 0, reorderLevel: 5, maxStock: 25, image: '', createdAt: new Date() },
];

export const mockCategories = [
  { _id: 'cat_1', name: 'Laptops & Computers', description: 'Desktops, ultrabooks, workstations' },
  { _id: 'cat_2', name: 'Mobile Devices', description: 'Smartphones, tablets, smartwatches' },
  { _id: 'cat_3', name: 'Peripherals', description: 'Mice, mechanical keyboards, monitors' },
  { _id: 'cat_4', name: 'Audio & Video', description: 'Headphones, Bluetooth speakers' },
  { _id: 'cat_5', name: 'Storage & Accessories', description: 'SSDs, external drives, hubs' },
];

export const mockSuppliers = [
  { _id: 'sup_1', name: 'Rajesh Kumar', company: 'TechDistro India Ltd', email: 'sales@techdistro.in', phone: '+91 80 4455 6677', address: 'MG Road, Bengaluru', gstNumber: '29ABCDE1234F1Z5' },
  { _id: 'sup_2', name: 'Anil Mehta', company: 'Silicon Component Traders', email: 'orders@siliconcomp.com', phone: '+91 22 8899 0011', address: 'Andheri East, Mumbai', gstNumber: '27GHIJK5678L1Z9' },
  { _id: 'sup_3', name: 'David Miller', company: 'Global Micro Systems', email: 'contact@globalmicro.io', phone: '+1 408 555 0199', address: 'San Jose, CA, USA', gstNumber: 'FOREIGN_EXP_99' },
];
