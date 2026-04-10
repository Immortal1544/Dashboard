import Company from '../models/Company.js';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';
import SeedState from '../models/SeedState.js';

const SEED_KEY = 'initial-products-purchases-v1';

const SEED_COMPANY_NAMES = [
  'Aurora Tech',
  'BluePeak Retail',
  'Nimbus Logistics'
];

const SEED_PRODUCTS = [
  { name: 'Cloud POS Terminal', companyName: 'Aurora Tech', unit: 'piece' },
  { name: 'Retail Barcode Scanner', companyName: 'BluePeak Retail', unit: 'piece' },
  { name: 'Smart Dispatch Tablet', companyName: 'Nimbus Logistics', unit: 'piece' },
  { name: 'Inventory Label Printer', companyName: 'BluePeak Retail', unit: 'piece' },
  { name: 'Warehouse Handheld', companyName: 'Nimbus Logistics', unit: 'piece' }
];

const SEED_PURCHASES = [
  {
    productName: 'Cloud POS Terminal',
    companyName: 'Aurora Tech',
    quantity: 18,
    pricePerUnit: 420,
    date: '2026-01-12'
  },
  {
    productName: 'Retail Barcode Scanner',
    companyName: 'BluePeak Retail',
    quantity: 36,
    pricePerUnit: 110,
    date: '2026-01-18'
  },
  {
    productName: 'Smart Dispatch Tablet',
    companyName: 'Nimbus Logistics',
    quantity: 22,
    pricePerUnit: 285,
    date: '2026-02-05'
  },
  {
    productName: 'Inventory Label Printer',
    companyName: 'BluePeak Retail',
    quantity: 14,
    pricePerUnit: 360,
    date: '2026-02-20'
  },
  {
    productName: 'Warehouse Handheld',
    companyName: 'Nimbus Logistics',
    quantity: 20,
    pricePerUnit: 250,
    date: '2026-03-08'
  }
];

const upsertCompanies = async () => {
  const companyMap = new Map();

  for (const companyName of SEED_COMPANY_NAMES) {
    const company = await Company.findOneAndUpdate(
      { name: companyName },
      { $setOnInsert: { name: companyName } },
      { new: true, upsert: true }
    );

    companyMap.set(companyName, company);
  }

  return companyMap;
};

const seedProducts = async (companyMap) => {
  const productMap = new Map();

  for (const entry of SEED_PRODUCTS) {
    const company = companyMap.get(entry.companyName);
    if (!company) continue;

    const product = await Product.findOneAndUpdate(
      { name: entry.name, company: company._id },
      { $setOnInsert: { name: entry.name, unit: entry.unit, company: company._id } },
      { new: true, upsert: true }
    );

    productMap.set(`${entry.name}::${entry.companyName}`, product);
  }

  return productMap;
};

const seedPurchases = async (companyMap, productMap) => {
  const existingPurchaseCount = await Purchase.countDocuments();
  if (existingPurchaseCount > 0) {
    return { created: 0, skipped: true };
  }

  const purchaseDocs = SEED_PURCHASES
    .map((entry) => {
      const company = companyMap.get(entry.companyName);
      const product = productMap.get(`${entry.productName}::${entry.companyName}`);

      if (!company || !product) return null;

      const quantity = Number(entry.quantity);
      const pricePerUnit = Number(entry.pricePerUnit);

      return {
        product: product._id,
        company: company._id,
        quantity,
        pricePerUnit,
        totalAmount: quantity * pricePerUnit,
        date: new Date(entry.date)
      };
    })
    .filter(Boolean);

  if (purchaseDocs.length === 0) {
    return { created: 0, skipped: true };
  }

  await Purchase.insertMany(purchaseDocs, { ordered: true });
  return { created: purchaseDocs.length, skipped: false };
};

export const seedInitialData = async () => {
  const existingState = await SeedState.findOne({ key: SEED_KEY });
  if (existingState) {
    return { seeded: false, reason: 'already-seeded' };
  }

  const [productCount, purchaseCount] = await Promise.all([
    Product.countDocuments(),
    Purchase.countDocuments()
  ]);

  if (productCount > 0 || purchaseCount > 0) {
    await SeedState.findOneAndUpdate(
      { key: SEED_KEY },
      {
        $setOnInsert: {
          key: SEED_KEY,
          details: 'Skipped initial seed because existing products or purchases were detected.'
        }
      },
      { upsert: true }
    );

    return { seeded: false, reason: 'existing-data' };
  }

  const companyMap = await upsertCompanies();
  const productMap = await seedProducts(companyMap);
  const purchaseResult = await seedPurchases(companyMap, productMap);

  await SeedState.findOneAndUpdate(
    { key: SEED_KEY },
    {
      $setOnInsert: {
        key: SEED_KEY,
        details: `Initial products and purchases seeded. Purchases created: ${purchaseResult.created}`
      }
    },
    { upsert: true }
  );

  return {
    seeded: true,
    products: productMap.size,
    purchases: purchaseResult.created
  };
};

export default seedInitialData;
