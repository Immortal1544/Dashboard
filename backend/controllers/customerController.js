import Customer from '../models/Customer.js';
import Company from '../models/Company.js';

export const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, companyId } = req.body;

    if (companyId) {
      const companyExists = await Company.exists({ _id: companyId });
      if (!companyExists) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    const customer = await Customer.create({
      name,
      phone,
      company: companyId || undefined
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req, res, next) => {
  try {
    const { companyId } = req.query;
    const filter = {};

    if (companyId) {
      filter.company = companyId;
    }

    const customers = await Customer.find(filter)
      .populate('company', 'name')
      .sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, companyId } = req.body;

    if (companyId) {
      const companyExists = await Company.exists({ _id: companyId });
      if (!companyExists) {
        return res.status(404).json({ message: 'Company not found' });
      }
    }

    const updated = await Customer.findByIdAndUpdate(
      id,
      {
        name,
        phone,
        company: companyId || undefined
      },
      { new: true, runValidators: true }
    ).populate('company', 'name');

    if (!updated) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Customer.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};
