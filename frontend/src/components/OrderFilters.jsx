function OrderFilters({ filter, monthOptions, yearOptions, customers, onChange }) {
  const sortedCustomers = [...customers].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), undefined, { sensitivity: 'base' }));

  return (
    <div className="mt-4 grid grid-cols-4 gap-4 items-end">
      <label className="space-y-1">
        <span className="field-label">Filter month</span>
        <select
          name="month"
          value={filter.month}
          onChange={onChange}
          className="select-control"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="field-label">Filter year</span>
        <select
          name="year"
          value={filter.year}
          onChange={onChange}
          className="select-control"
        >
          {yearOptions.map((value) => (
            <option key={value} value={value}>{value === 'All' ? 'All years' : String(value)}</option>
          ))}
        </select>
      </label>

      <label className="space-y-1">
        <span className="field-label">Filter customer</span>
        <select
          name="customerId"
          value={filter.customerId}
          onChange={onChange}
          className="select-control"
        >
          <option value="All">All customers</option>
          {sortedCustomers.map((customer) => (
            <option key={customer._id} value={customer._id}>{customer.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default OrderFilters;
