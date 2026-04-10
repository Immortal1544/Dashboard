export const PRODUCT_UNIT_OPTIONS = ['kg', 'box', 'packet', 'litre', 'piece'];

const PLURAL_UNIT_MAP = {
  kg: 'kg',
  box: 'boxes',
  packet: 'packets',
  litre: 'litres',
  piece: 'pieces'
};

export const resolveProductUnit = (unit) => {
  if (!unit) return 'piece';
  return String(unit).trim().toLowerCase();
};

export const formatQuantityWithUnit = (quantity, unit) => {
  const resolvedUnit = resolveProductUnit(unit);
  const numericQuantity = Number(quantity);

  if (!Number.isFinite(numericQuantity)) {
    return `${quantity ?? 0} ${PLURAL_UNIT_MAP[resolvedUnit] || `${resolvedUnit}s`}`;
  }

  const displayUnit = Math.abs(numericQuantity) === 1
    ? resolvedUnit
    : (PLURAL_UNIT_MAP[resolvedUnit] || `${resolvedUnit}s`);

  return `${numericQuantity} ${displayUnit}`;
};
