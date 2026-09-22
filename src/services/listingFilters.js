import { getUser, getViewTenantId } from './session';

const selectedShopId = () => {
  try {
    const shop = JSON.parse(localStorage.getItem('selectedShop') || 'null');
    return shop?.id || 'all';
  } catch (e) {
    return 'all';
  }
};

export function listingStorageKey(basePath) {
  const user = getUser();
  const tenant = getViewTenantId() || user?.tenant?.id || 'none';
  return `ims.listing.${basePath}.t${tenant}.s${selectedShopId()}`;
}

export function readListingState(basePath) {
  try {
    const raw = localStorage.getItem(listingStorageKey(basePath));
    if (!raw) {
      return { filters: {}, page: 1, limit: 10 };
    }
    const parsed = JSON.parse(raw);
    return {
      filters: parsed.filters && typeof parsed.filters === 'object' ? parsed.filters : {},
      page: Number(parsed.page) > 0 ? Number(parsed.page) : 1,
      limit: Number(parsed.limit) > 0 ? Number(parsed.limit) : 10,
    };
  } catch (e) {
    return { filters: {}, page: 1, limit: 10 };
  }
}

export function writeListingState(basePath, state) {
  localStorage.setItem(listingStorageKey(basePath), JSON.stringify({
    filters: state.filters || {},
    page: state.page || 1,
    limit: state.limit || 10,
  }));
}

export function clearListingState(basePath) {
  localStorage.removeItem(listingStorageKey(basePath));
}

export function compactFilters(filters = {}) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined && value !== false),
  );
}
