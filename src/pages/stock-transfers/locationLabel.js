export const locationLabel = (shop, store) => shop?.name || store?.name || '—';

export const formatTransferDate = (value) => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};
