import Company from '../models/Company.js';
import Product from '../models/Product.js';
import Purchase from '../models/Purchase.js';

const getDateRangeFilter = (startDate, endDate) => {
  const range = {};

  if (startDate) {
    const parsedStart = new Date(startDate);
    if (Number.isFinite(parsedStart.getTime())) {
      range.$gte = parsedStart;
    }
  }

  if (endDate) {
    const parsedEnd = new Date(endDate);
    if (Number.isFinite(parsedEnd.getTime())) {
      range.$lte = parsedEnd;
    }
  }

  return Object.keys(range).length ? range : null;
};

export const createPurchase = async (req, res, next) => {
  try {
    const { productId, companyId, quantity, totalAmount, date } = req.body;

    if (!productId || !companyId || !quantity || totalAmount === undefined || !date) {
      return res.status(400).json({
        message: 'productId, companyId, quantity, totalAmount, and date are required'
      });
    }

    const [product, company] = await Promise.all([
      Product.findById(productId),
      Company.findById(companyId)
    ]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const normalizedQuantity = Number(quantity);
    const normalizedTotalAmount = Number(totalAmount);

    const purchase = await Purchase.create({
      product: product._id,
      company: company._id,
      quantity: normalizedQuantity,
      totalAmount: normalizedTotalAmount,
      date: new Date(date)
    });

    const populated = await Purchase.findById(purchase._id)
      .populate('product')
      .populate('company');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const listPurchases = async (req, res, next) => {
  try {
    const { month, year, companyId, productId, startDate, endDate } = req.query;
    const filter = {};

    if (companyId) {
      filter.company = companyId;
    }

    if (productId) {
      filter.product = productId;
    }

    const explicitDateRange = getDateRangeFilter(startDate, endDate);

    if (explicitDateRange) {
      filter.date = explicitDateRange;
    } else {
      if (year) {
        const yearNum = Number(year);
        filter.date = {
          $gte: new Date(yearNum, 0, 1),
          $lte: new Date(yearNum, 11, 31, 23, 59, 59)
        };
      }

      if (month) {
        const monthNum = Number(month) - 1;
        const selectedYear = Number(year) || new Date().getFullYear();
        filter.date = {
          $gte: new Date(selectedYear, monthNum, 1),
          $lte: new Date(selectedYear, monthNum + 1, 0, 23, 59, 59)
        };
      }
    }

    const purchases = await Purchase.find(filter)
      .populate('product')
      .populate('company')
      .sort({ date: -1 });

    res.json(purchases);
  } catch (error) {
    next(error);
  }
};

export const updatePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId, companyId, quantity, totalAmount, date } = req.body;

    if (!productId || !companyId || !quantity || totalAmount === undefined || !date) {
      return res.status(400).json({
        message: 'productId, companyId, quantity, totalAmount, and date are required'
      });
    }

    const [product, company] = await Promise.all([
      Product.findById(productId),
      Company.findById(companyId)
    ]);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const normalizedQuantity = Number(quantity);
    const normalizedTotalAmount = Number(totalAmount);

    const updated = await Purchase.findByIdAndUpdate(
      id,
      {
        product: product._id,
        company: company._id,
        quantity: normalizedQuantity,
        totalAmount: normalizedTotalAmount,
        date: new Date(date)
      },
      { new: true, runValidators: true }
    )
      .populate('product')
      .populate('company');

    if (!updated) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deletePurchase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Purchase.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.json({ message: 'Purchase deleted' });
  } catch (error) {
    next(error);
  }
};
