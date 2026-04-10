import Company from '../models/Company.js';
import Product from '../models/Product.js';

export const createProduct = async (req, res, next) => {
  try {
    const { name, companyId, unit } = req.body;

    if (!name || !companyId || !unit) {
      return res.status(400).json({ message: 'name, companyId and unit are required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const product = await Product.create({
      name: String(name).trim(),
      unit: String(unit).trim().toLowerCase(),
      company: company._id
    });

    const populated = await Product.findById(product._id).populate('company');
    res.status(201).json(populated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Product already exists for this company' });
    }
    next(error);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const products = await Product.find({})
      .populate('company')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, companyId, unit } = req.body;

    if (!name || !companyId || !unit) {
      return res.status(400).json({ message: 'name, companyId and unit are required' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        unit: String(unit).trim().toLowerCase(),
        company: company._id
      },
      { new: true, runValidators: true }
    ).populate('company');

    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(updated);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Product already exists for this company' });
    }
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    next(error);
  }
};
