import ExpenseForm from '../components/ExpenseForm.jsx';
import ExpenseTable from '../components/ExpenseTable.jsx';
import EditModal from '../components/EditModal.jsx';
import { useExpenses } from '../hooks/useExpenses.js';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency.js';
import { toast } from '../utils/toast.js';

function Expenses() {
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', date: '', amount: '' });
  const {
    expenses,
    filter,
    form,
    loading,
    saving,
    deletingId,
    updatingId,
    error,
    financialOverview,
    monthOptions,
    yearOptions,
    setFormField,
    setFilterField,
    addExpense,
    removeExpense,
    editExpense
  } = useExpenses();

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormField(name, value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterField(name, value);
  };

  const handleDeleteExpense = async (expense) => {
    if (!window.confirm('Are you sure you want to delete this?')) return;
    try {
      await removeExpense(expense._id);
      toast.success('Expense deleted successfully');
    } catch {
      toast.error('Failed to delete expense');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  const openEditModal = (expense) => {
    setExpenseToEdit(expense);
    setEditForm({
      title: expense.title || '',
      date: expense.date ? String(expense.date).slice(0, 10) : '',
      amount: expense.amount || ''
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    if (!expenseToEdit || !editForm.title.trim() || !editForm.date || !editForm.amount) return;
    try {
      await editExpense(expenseToEdit._id, {
        title: editForm.title,
        date: editForm.date,
        amount: Number(editForm.amount)
      });
      setExpenseToEdit(null);
      toast.success('Expense updated successfully');
    } catch {
      toast.error('Failed to update expense');
      // Error is handled in hook state and rendered in page alert.
    }
  };

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const profitColorClass = financialOverview.profit >= 0
    ? 'text-[color:var(--accent-green)]'
    : 'text-[color:var(--accent-red)]';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="section-heading">Financial Summary</h2>
          <p className="section-subtext">Business-overview totals are shown here for quick control.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-colors duration-300 dark:border-[#1F2937] dark:bg-[#111827]">
            <p className="text-sm text-[color:var(--text-muted)]">Total Sales</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--accent-blue)]">{formatCurrency(financialOverview.totalSales)}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-colors duration-300 dark:border-[#1F2937] dark:bg-[#111827]">
            <p className="text-sm text-[color:var(--text-muted)]">Total Purchases</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--accent-red)]">{formatCurrency(financialOverview.totalPurchases)}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-colors duration-300 dark:border-[#1F2937] dark:bg-[#111827]">
            <p className="text-sm text-[color:var(--text-muted)]">Total Expenses</p>
            <p className="mt-2 text-2xl font-semibold text-[color:var(--warn)]">{formatCurrency(financialOverview.totalExpenses)}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 transition-colors duration-300 dark:border-[#1F2937] dark:bg-[#111827]">
            <p className="text-sm text-[color:var(--text-muted)]">Profit</p>
            <p className={`mt-2 text-2xl font-semibold ${profitColorClass}`}>{formatCurrency(financialOverview.profit)}</p>
          </div>
        </div>
      </div>

      <div className="surface-panel p-6">
        <div className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-heading">Expenses</h2>
            <p className="section-subtext">Record expenses and track monthly outflow.</p>
          </div>
        </div>

        <ExpenseForm form={form} onChange={handleFormChange} onSubmit={addExpense} saving={saving} />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label>
            <span className="field-label">Filter month</span>
            <select
              name="month"
              value={filter.month}
              onChange={handleFilterChange}
              className="select-control"
            >
              {monthOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="field-label">Filter year</span>
            <select
              name="year"
              value={filter.year}
              onChange={handleFilterChange}
              className="select-control"
            >
              {yearOptions.map((value) => (
                <option key={value} value={value}>{value === 'All' ? 'All years' : String(value)}</option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-[color:var(--accent-red)] bg-[color:var(--accent-red)]/5 p-4 text-sm text-[color:var(--accent-red)]">
            {error}
          </div>
        )}

        <ExpenseTable
          expenses={expenses}
          loading={loading}
          deletingId={deletingId}
          updatingId={updatingId}
          onDelete={handleDeleteExpense}
          onEdit={openEditModal}
        />
      </div>

      <EditModal
        open={Boolean(expenseToEdit)}
        title="Edit expense"
        saving={updatingId === expenseToEdit?._id}
        onSave={handleEditSave}
        onCancel={() => setExpenseToEdit(null)}
      >
        <label>
          <span className="field-label">Title</span>
          <input
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            className="field-control"
            required
          />
        </label>
        <label>
          <span className="field-label">Date</span>
          <input
            type="date"
            name="date"
            value={editForm.date}
            onChange={handleEditChange}
            className="field-control"
            required
          />
        </label>
        <label>
          <span className="field-label">Amount</span>
          <input
            type="number"
            min="0"
            step="0.01"
            name="amount"
            value={editForm.amount}
            onChange={handleEditChange}
            className="field-control"
            required
          />
        </label>
      </EditModal>
    </div>
  );
}

export default Expenses;
