// 10 Core Retail Grocery Items for Store Catalog
export const INITIAL_PRODUCTS = [
  {
    id: 2,
    sku: 'SKU-1001',
    barcode: '8901030383748',
    name: 'Aashirvaad Shudh Chakki Atta (5 kg)',
    brand: 'ITC Aashirvaad',
    pack: '5 kg Bag',
    cat: 'Flours & Rice',
    unit: 'bag',
    cost: 210,
    price: 245,
    stock: 50,
    gstRate: 0.05
  },
  {
    id: 3,
    sku: 'SKU-1002',
    barcode: '8906007280123',
    name: 'Fortune Sunlite Refined Sunflower Oil (1 L)',
    brand: 'Fortune',
    pack: '1 L Pouch',
    cat: 'Oils & Ghee',
    unit: 'pouch',
    cost: 125,
    price: 145,
    stock: 50,
    gstRate: 0.05
  },
  {
    id: 4,
    sku: 'SKU-1003',
    barcode: '8901058852814',
    name: 'Tata Sampann Unpolished Toor Dal (1 kg)',
    brand: 'Tata Sampann',
    pack: '1 kg Pouch',
    cat: 'Dals & Pulses',
    unit: 'pkt',
    cost: 140,
    price: 165,
    stock: 50,
    gstRate: 0.00
  },
  {
    id: 5,
    sku: 'SKU-1004',
    barcode: '8901262010052',
    name: 'Amul Butter Pasteurized (500 g)',
    brand: 'Amul',
    pack: '500 g Pack',
    cat: 'Dairy & Spreads',
    unit: 'pc',
    cost: 240,
    price: 275,
    stock: 50,
    gstRate: 0.12
  },
  {
    id: 6,
    sku: 'SKU-1005',
    barcode: '8901052002345',
    name: 'Tata Tea Gold Premium Tea (500 g)',
    brand: 'Tata Tea',
    pack: '500 g Pouch',
    cat: 'Tea & Coffee',
    unit: 'pkt',
    cost: 280,
    price: 320,
    stock: 50,
    gstRate: 0.05
  },
  {
    id: 7,
    sku: 'SKU-1006',
    barcode: '8901058863412',
    name: 'Maggi 2-Minute Masala Noodles (Pack of 4, 280 g)',
    brand: 'Nestle Maggi',
    pack: '4-in-1 Pack',
    cat: 'Packaged Food',
    unit: 'pack',
    cost: 48,
    price: 56,
    stock: 50,
    gstRate: 0.12
  },
  {
    id: 8,
    sku: 'SKU-1007',
    barcode: '8901719102431',
    name: 'Parle-G Original Glucose Biscuits (800 g Family Pack)',
    brand: 'Parle',
    pack: '800 g Family Pack',
    cat: 'Biscuits & Snacks',
    unit: 'pack',
    cost: 68,
    price: 80,
    stock: 50,
    gstRate: 0.18
  },
  {
    id: 9,
    sku: 'SKU-1008',
    barcode: '8901686001018',
    name: 'Everest Turmeric Powder / Haldi (200 g)',
    brand: 'Everest',
    pack: '200 g Box',
    cat: 'Spices & Masala',
    unit: 'box',
    cost: 52,
    price: 65,
    stock: 50,
    gstRate: 0.05
  },
  {
    id: 10,
    sku: 'SKU-1009',
    barcode: '8901030825412',
    name: 'Surf Excel Easy Wash Detergent Powder (1 kg)',
    brand: 'Surf Excel',
    pack: '1 kg Pouch',
    cat: 'Household & Cleaning',
    unit: 'pkt',
    cost: 115,
    price: 138,
    stock: 50,
    gstRate: 0.18
  },
  {
    id: 11,
    sku: 'SKU-1010',
    barcode: '8901396328712',
    name: 'Dettol Original Germ Protection Bathing Soap (125 g x 3)',
    brand: 'Dettol',
    pack: 'Pack of 3 (375 g)',
    cat: 'Personal Care',
    unit: 'pack',
    cost: 135,
    price: 160,
    stock: 40,
    gstRate: 0.18
  }
];

export const INITIAL_ORDERS = [
  {
    orderId: 'ORD-8821',
    storeName: 'Apna Bazar Supermarket',
    customerName: 'Gaurav Sharma',
    customerPhone: '9528590856',
    fulfillmentMode: 'delivery',
    address: 'House #14, Sector 12, Main Market (Near Shiva Temple)',
    listType: 'Manual Items',
    itemsSummary: 'Aashirvaad Atta 5kg (1), Fortune Sunflower Oil 1L (2), Tata Toor Dal 1kg (1), Amul Butter 500g (1), Tata Tea Gold 500g (1), Maggi 4-in-1 (2), Parle-G Family Pack (1), Everest Haldi (1), Surf Excel 1kg (1), Dettol Soap 3-Pack (1)',
    itemsList: [
      { name: 'Aashirvaad Shudh Chakki Atta (5 kg)', qty: '1 bag', price: 245 },
      { name: 'Fortune Sunlite Refined Sunflower Oil (1 L)', qty: '2 pouch', price: 290 },
      { name: 'Tata Sampann Unpolished Toor Dal (1 kg)', qty: '1 pkt', price: 165 },
      { name: 'Amul Butter Pasteurized (500 g)', qty: '1 pc', price: 275 },
      { name: 'Tata Tea Gold Premium Tea (500 g)', qty: '1 pkt', price: 320 },
      { name: 'Maggi 2-Minute Masala Noodles (Pack of 4, 280 g)', qty: '2 pack', price: 112 },
      { name: 'Parle-G Original Glucose Biscuits (800 g)', qty: '1 pack', price: 80 },
      { name: 'Everest Turmeric Powder / Haldi (200 g)', qty: '1 box', price: 65 },
      { name: 'Surf Excel Easy Wash Detergent Powder (1 kg)', qty: '1 pkt', price: 138 },
      { name: 'Dettol Original Germ Protection Bathing Soap (125 g x 3)', qty: '1 pack', price: 160 }
    ],
    estimatedTotal: 1850,
    placedAt: '03:45 PM',
    status: 'PENDING_REVIEW'
  }
];

export const INITIAL_KHATA = [];

export const INITIAL_PO = [];

export const DEFAULT_CATEGORIES = [
  'Flours & Rice',
  'Dals & Pulses',
  'Oils & Ghee',
  'Dairy & Spreads',
  'Spices & Masala',
  'Tea & Coffee',
  'Packaged Food',
  'Biscuits & Snacks',
  'Beverages & Cold Drinks',
  'Household & Cleaning',
  'Personal Care',
  'General Grocery'
];

export const INITIAL_SETTINGS = {
  storeName: 'Apna Bazar Supermarket',
  storeCode: 'DEL-8821',
  gstin: '07AAACA1234F1Z8',
  phone: '+91 11-49827361',
  address: 'Sector 12, Main Market, New Delhi - 110078',
  cashierName: 'Rajesh Kumar',
  cashierRole: 'Store Manager',
  latitude: 28.5921,
  longitude: 77.0460,
  delivery: {
    enabled: true,
    minOrderValue: 499,
    deliveryFee: 30,
    maxRadiusKm: 10.0,
    avgSlaMins: 35
  }
};
