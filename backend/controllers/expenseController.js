import Expense from '../models/Expense.js';

export const createExpense = async (req, res, next) => {
  try {
    const { title, amount, date } = req.body;
    const expense = await Expense.create({
      title,
      amount,
      date: new Date(date)
    });
    res.status(201).json(expense);
  } catch (error) {
    next(error);
  }
};

export const listExpenses = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const filter = {};

    if (year) {
      const yearNum = Number(year);
      filter.date = {
        $gte: new Date(yearNum, 0, 1),
        $lte: new Date(yearNum, 11, 31, 23, 59, 59)
      };
    }

    if (month) {
      const monthNum = Number(month) - 1;
      filter.date = {
        $gte: new Date(Number(year) || 1970, monthNum, 1),
        $lte: new Date(Number(year) || new Date().getFullYear(), monthNum + 1, 0, 23, 59, 59)
      };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, amount, date } = req.body;

    const updated = await Expense.findByIdAndUpdate(
      id,
      {
        title,
        amount,
        date: new Date(date)
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};
