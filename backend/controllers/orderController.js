import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';

const PAYMENT_STATUSES = ['Paid', 'Pending', 'Partial'];

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

const normalizePaymentDetails = ({ paymentStatus, paidAmount, totalAmount }) => {
  const normalizedTotalAmount = Number(totalAmount);
  const status = paymentStatus || 'Pending';

  if (!PAYMENT_STATUSES.includes(status)) {
    return { error: 'paymentStatus must be one of Paid, Pending, or Partial' };
  }

  let normalizedPaidAmount = 0;

  if (status === 'Paid') {
    normalizedPaidAmount = normalizedTotalAmount;
  } else if (status === 'Pending') {
    normalizedPaidAmount = 0;
  } else {
    if (paidAmount === undefined || paidAmount === null || paidAmount === '') {
      return { error: 'paidAmount is required when paymentStatus is Partial' };
    }

    normalizedPaidAmount = Number(paidAmount);
  }

  if (!Number.isFinite(normalizedPaidAmount) || normalizedPaidAmount < 0) {
    return { error: 'paidAmount must be a valid non-negative number' };
  }

  if (normalizedPaidAmount > normalizedTotalAmount) {
    return { error: 'paidAmount cannot be greater than totalAmount' };
  }

  return {
    paymentStatus: status,
    paidAmount: normalizedPaidAmount,
    remainingAmount: normalizedTotalAmount - normalizedPaidAmount
  };
};

export const createOrder = async (req, res, next) => {
  try {
    const { customerId, productId, orderDate, quantity, totalAmount, paymentStatus, paidAmount } = req.body;

    if (!customerId || !orderDate || !quantity || totalAmount === undefined) {
      return res.status(400).json({
        message: 'customerId, orderDate, quantity, and totalAmount are required'
      });
    }

    const [customer, product] = await Promise.all([
      Customer.findById(customerId),
      productId ? Product.findById(productId) : Promise.resolve(null)
    ]);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (productId && !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const normalizedQuantity = Number(quantity);
    const normalizedTotalAmount = Number(totalAmount);

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return res.status(400).json({ message: 'quantity must be a valid number greater than 0' });
    }

    if (!Number.isFinite(normalizedTotalAmount) || normalizedTotalAmount < 0) {
      return res.status(400).json({ message: 'totalAmount must be a valid non-negative number' });
    }

    const paymentDetails = normalizePaymentDetails({
      paymentStatus,
      paidAmount,
      totalAmount: normalizedTotalAmount
    });

    if (paymentDetails.error) {
      return res.status(400).json({ message: paymentDetails.error });
    }

    const order = await Order.create({
      product: product?._id,
      customer: customer._id,
      quantity: normalizedQuantity,
      totalAmount: normalizedTotalAmount,
      paymentStatus: paymentDetails.paymentStatus,
      paidAmount: paymentDetails.paidAmount,
      remainingAmount: paymentDetails.remainingAmount,
      orderDate: new Date(orderDate)
    });

    const populated = await Order.findById(order._id)
      .populate('customer')
      .populate('product');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req, res, next) => {
  try {
    const { month, year, customerId, productId, startDate, endDate } = req.query;
    const filter = {};

    if (customerId) {
      filter.customer = customerId;
    }

    if (productId) {
      filter.product = productId;
    }

    const explicitDateRange = getDateRangeFilter(startDate, endDate);

    if (explicitDateRange) {
      filter.orderDate = explicitDateRange;
    } else {
      if (year) {
        const yearNum = Number(year);
        filter.orderDate = {
          $gte: new Date(yearNum, 0, 1),
          $lte: new Date(yearNum, 11, 31, 23, 59, 59)
        };
      }

      if (month) {
        const monthNum = Number(month) - 1;
        if (!Number.isNaN(monthNum)) {
          const selectedYear = Number(year) || new Date().getFullYear();
          filter.orderDate = {
            $gte: new Date(selectedYear, monthNum, 1),
            $lte: new Date(selectedYear, monthNum + 1, 0, 23, 59, 59)
          };
        }
      }
    }

    const orders = await Order.find(filter)
      .populate('customer')
      .populate('product')
      .sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { customerId, productId, orderDate, quantity, totalAmount, paymentStatus, paidAmount } = req.body;

    if (!customerId || !orderDate || !quantity || totalAmount === undefined) {
      return res.status(400).json({
        message: 'customerId, orderDate, quantity, and totalAmount are required'
      });
    }

    const [customer, product] = await Promise.all([
      Customer.findById(customerId),
      productId ? Product.findById(productId) : Promise.resolve(null)
    ]);

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (productId && !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const normalizedQuantity = Number(quantity);
    const normalizedTotalAmount = Number(totalAmount);

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return res.status(400).json({ message: 'quantity must be a valid number greater than 0' });
    }

    if (!Number.isFinite(normalizedTotalAmount) || normalizedTotalAmount < 0) {
      return res.status(400).json({ message: 'totalAmount must be a valid non-negative number' });
    }

    const paymentDetails = normalizePaymentDetails({
      paymentStatus,
      paidAmount,
      totalAmount: normalizedTotalAmount
    });

    if (paymentDetails.error) {
      return res.status(400).json({ message: paymentDetails.error });
    }

    const updated = await Order.findByIdAndUpdate(
      id,
      {
        product: product?._id,
        customer: customer._id,
        quantity: normalizedQuantity,
        totalAmount: normalizedTotalAmount,
        paymentStatus: paymentDetails.paymentStatus,
        paidAmount: paymentDetails.paidAmount,
        remainingAmount: paymentDetails.remainingAmount,
        orderDate: new Date(orderDate)
      },
      { new: true, runValidators: true }
    )
      .populate('customer')
      .populate('product');

    if (!updated) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted' });
  } catch (error) {
    next(error);
  }
};
