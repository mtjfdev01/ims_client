export const ITEM_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'grade_a', label: 'Grade A' },
  { value: 'grade_b', label: 'Grade B' },
  { value: 'grade_c', label: 'Grade C' },
];

export const conditionLabel = (value) => (
  ITEM_CONDITIONS.find((entry) => entry.value === value)?.label || value || '—'
);

export const itemNameLabel = (item) => item?.name || 'Item';

export const itemOptionLabel = (item) => {
  const name = itemNameLabel(item);
  if (item?.quantity !== undefined && item.quantity !== null) {
    return `${name} (Qty: ${item.quantity})`;
  }
  return name;
};
