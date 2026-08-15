const Organization = require('../models/Organization');
const User = require('../models/User');
const Category = require('../models/Category');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const InventoryTransaction = require('../models/InventoryTransaction');
const Subscription = require('../models/Subscription');

const seedDatabase = async () => {
  try {
    // 1. Create Primary Organization: ABC Electronics
    const org = await Organization.create({
      name: 'ABC Electronics',
      email: 'contact@abcelectronics.com',
      phone: '+91 98765 43210',
      address: '104 Tech Park, Whitefield, Bengaluru, KA 560066',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      plan: 'PRO',
      subscriptionStatus: 'ACTIVE',
    });

    await Subscription.create({
      organizationId: org._id,
      plan: 'PRO',
      status: 'ACTIVE',
    });

    // 2. Create Users (Admin, Manager, Staff)
    const admin = await User.create({
      name: 'Sarah Connor',
      email: 'admin@abcelectronics.com',
      password: 'Password123!',
      role: 'ADMIN',
      organizationId: org._id,
      status: 'ACTIVE',
    });

    const manager = await User.create({
      name: 'John Doe',
      email: 'manager@abcelectronics.com',
      password: 'Password123!',
      role: 'MANAGER',
      organizationId: org._id,
      status: 'ACTIVE',
    });

    const staff = await User.create({
      name: 'Alice Smith',
      email: 'staff@abcelectronics.com',
      password: 'Password123!',
      role: 'STAFF',
      organizationId: org._id,
      status: 'ACTIVE',
    });

    // 3. Create Categories
    const categoriesData = [
      { name: 'Laptops & Computers', description: 'Desktops, ultrabooks, and workstations' },
      { name: 'Mobile Devices', description: 'Smartphones, tablets, and smartwatches' },
      { name: 'Peripherals', description: 'Mice, mechanical keyboards, monitors' },
      { name: 'Audio & Video', description: 'Noise cancelling headphones, Bluetooth speakers' },
      { name: 'Storage & Accessories', description: 'SSDs, external drives, cables, hubs' },
    ];

    const categories = [];
    for (const cat of categoriesData) {
      const createdCat = await Category.create({
        ...cat,
        organizationId: org._id,
      });
      categories.push(createdCat);
    }

    // 4. Create Suppliers
    const suppliersData = [
      { name: 'Rajesh Kumar', company: 'TechDistro India Ltd', email: 'sales@techdistro.in', phone: '+91 80 4455 6677', address: 'MG Road, Bengaluru', gstNumber: '29ABCDE1234F1Z5' },
      { name: 'Anil Mehta', company: 'Silicon Component Traders', email: 'orders@siliconcomp.com', phone: '+91 22 8899 0011', address: 'Andheri East, Mumbai', gstNumber: '27GHIJK5678L1Z9' },
      { name: 'David Miller', company: 'Global Micro Systems', email: 'contact@globalmicro.io', phone: '+1 408 555 0199', address: 'San Jose, CA, USA', gstNumber: 'FOREIGN_EXP_99' },
      { name: 'Priya Sharma', company: 'Apex Electronics Supplies', email: 'priya@apexelectronics.in', phone: '+91 44 2345 6789', address: 'Guindy, Chennai', gstNumber: '33MNOPQ9012R1Z3' },
      { name: 'Suresh Patel', company: 'Nexus Components Ltd', email: 'info@nexuscomp.co.in', phone: '+91 79 1122 3344', address: 'SG Highway, Ahmedabad', gstNumber: '24STUVW3456T1Z1' },
    ];

    const suppliers = [];
    for (const sup of suppliersData) {
      const createdSup = await Supplier.create({
        ...sup,
        organizationId: org._id,
      });
      suppliers.push(createdSup);
    }

    // 5. Create 10 Products
    const productsData = [
      { name: 'Dell XPS 13 Laptop', sku: 'LAP001', description: 'Intel i7 13th Gen, 16GB RAM, 512GB SSD', categoryIdx: 0, supplierIdx: 0, purchasePrice: 85000, sellingPrice: 105000, stock: 12, reorderLevel: 5, maxStock: 25 },
      { name: 'MacBook Pro 14" M3', sku: 'LAP002', description: 'Apple M3 chip, 18GB RAM, 512GB SSD', categoryIdx: 0, supplierIdx: 2, purchasePrice: 145000, sellingPrice: 169900, stock: 8, reorderLevel: 3, maxStock: 15 },
      { name: 'Samsung Galaxy S24 Ultra', sku: 'MOB001', description: '512GB Titanium Gray 12GB RAM', categoryIdx: 1, supplierIdx: 1, purchasePrice: 98000, sellingPrice: 119999, stock: 15, reorderLevel: 6, maxStock: 30 },
      { name: 'iPhone 15 Pro Max', sku: 'MOB002', description: '256GB Natural Titanium', categoryIdx: 1, supplierIdx: 2, purchasePrice: 115000, sellingPrice: 134900, stock: 4, reorderLevel: 5, maxStock: 20 },
      { name: 'Logitech MX Master 3S Mouse', sku: 'MOU001', description: 'Ergonomic wireless mouse with quiet clicks', categoryIdx: 2, supplierIdx: 3, purchasePrice: 6500, sellingPrice: 8995, stock: 35, reorderLevel: 10, maxStock: 60 },
      { name: 'Keychron K2 Mechanical Keyboard', sku: 'KEY001', description: 'Wireless Bluetooth RGB Gaming Keyboard', categoryIdx: 2, supplierIdx: 4, purchasePrice: 5200, sellingPrice: 7499, stock: 3, reorderLevel: 10, maxStock: 40 },
      { name: 'Sony WH-1000XM5 Headphones', sku: 'AUD001', description: 'Noise Cancelling Wireless Headphones', categoryIdx: 3, supplierIdx: 0, purchasePrice: 22000, sellingPrice: 29990, stock: 18, reorderLevel: 5, maxStock: 35 },
      { name: 'Bose SoundLink Flex Speaker', sku: 'AUD002', description: 'Portable Bluetooth Waterproof Speaker', categoryIdx: 3, supplierIdx: 3, purchasePrice: 11000, sellingPrice: 14900, stock: 0, reorderLevel: 5, maxStock: 25 },
      { name: 'Samsung T7 Shield 1TB SSD', sku: 'STR001', description: 'Rugged Portable External SSD 1050MB/s', categoryIdx: 4, supplierIdx: 1, purchasePrice: 7000, sellingPrice: 9999, stock: 22, reorderLevel: 8, maxStock: 50 },
      { name: 'Anker 7-in-1 USB-C Hub', sku: 'ACC001', description: '4K HDMI, 100W Power Delivery, SD Card Reader', categoryIdx: 4, supplierIdx: 4, purchasePrice: 2800, sellingPrice: 4299, stock: 40, reorderLevel: 12, maxStock: 80 },
    ];

    const products = [];
    for (const p of productsData) {
      const createdProd = await Product.create({
        name: p.name,
        sku: p.sku,
        description: p.description,
        categoryId: categories[p.categoryIdx]._id,
        supplierId: suppliers[p.supplierIdx]._id,
        organizationId: org._id,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stock: p.stock,
        reorderLevel: p.reorderLevel,
        maxStock: p.maxStock,
        image: `https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80`,
      });
      products.push(createdProd);

      await InventoryTransaction.create({
        productId: createdProd._id,
        organizationId: org._id,
        type: 'PURCHASE',
        quantity: p.stock + 5,
        previousStock: 0,
        newStock: p.stock + 5,
        createdBy: admin._id,
      });
    }

    // 6. Purchases
    const purchase1 = await Purchase.create({
      supplierId: suppliers[0]._id,
      organizationId: org._id,
      items: [
        { productId: products[0]._id, quantity: 10, purchasePrice: 85000, total: 850000 },
        { productId: products[6]._id, quantity: 15, purchasePrice: 22000, total: 330000 },
      ],
      totalAmount: 1180000,
      createdBy: admin._id,
    });

    // 7. Sales
    const salesData = [
      {
        customer: { name: 'Metro Retail Store', phone: '+91 99887 11223', email: 'procurement@metro.com' },
        items: [
          { productId: products[0]._id, quantity: 2, sellingPrice: 105000, purchasePrice: 85000, total: 210000, profit: 40000 },
          { productId: products[4]._id, quantity: 5, sellingPrice: 8995, purchasePrice: 6500, total: 44975, profit: 12475 },
        ],
        subtotal: 254975,
        discount: 4975,
        tax: 45000,
        totalAmount: 295000,
        totalProfit: 47500,
        createdBy: staff._id,
      },
      {
        customer: { name: 'Apex Innovators Pvt Ltd', phone: '+91 98112 33445', email: 'admin@apexinnovate.io' },
        items: [
          { productId: products[1]._id, quantity: 1, sellingPrice: 169900, purchasePrice: 145000, total: 169900, profit: 24900 },
          { productId: products[8]._id, quantity: 3, sellingPrice: 9999, purchasePrice: 7000, total: 29997, profit: 8997 },
        ],
        subtotal: 199897,
        discount: 0,
        tax: 35981,
        totalAmount: 235878,
        totalProfit: 33897,
        createdBy: manager._id,
      },
    ];

    for (const sale of salesData) {
      const createdSale = await Sale.create({
        ...sale,
        organizationId: org._id,
      });

      for (const item of sale.items) {
        const prod = await Product.findById(item.productId);
        await InventoryTransaction.create({
          productId: item.productId,
          organizationId: org._id,
          type: 'SALE',
          quantity: item.quantity,
          previousStock: prod.stock + item.quantity,
          newStock: prod.stock,
          referenceId: createdSale._id,
          createdBy: sale.createdBy,
        });
      }
    }

    // Secondary Organization
    const orgB = await Organization.create({
      name: 'XYZ Stores Ltd',
      email: 'contact@xyzstores.com',
      phone: '+91 88776 65544',
      plan: 'FREE',
    });

    await User.create({
      name: 'Tenant B Admin',
      email: 'admin@xyzstores.com',
      password: 'Password123!',
      role: 'ADMIN',
      organizationId: orgB._id,
    });

    console.log('✅ Demo database seeded successfully!');
  } catch (error) {
    console.error('Error seeding helper database:', error);
  }
};

module.exports = seedDatabase;
