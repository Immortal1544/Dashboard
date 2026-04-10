import Company from '../models/Company.js';
import Customer from '../models/Customer.js';

export const createCompany = async (req, res, next) => {
  try {
    const { name } = req.body;
    const company = await Company.create({ name });
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

export const listCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updated = await Company.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customersCount = await Customer.countDocuments({ company: id });

    if (customersCount > 0) {
      return res.status(409).json({
        message: 'Cannot delete company with existing customers'
      });
    }

    const deleted = await Company.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted' });
  } catch (error) {
    next(error);
  }
};
