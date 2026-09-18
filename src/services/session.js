const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const TENANT_KEY = 'viewTenantId';
const SHOP_KEY = 'selectedShop';

export function notifySession() {
  window.dispatchEvent(new Event('ims-session'));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

export function isSuperAdmin(user = getUser()) {
  return user?.role === 'super_admin';
}

export function isTenantAdmin(user = getUser()) {
  return user?.role === 'tenant_admin';
}

const ROLE_PERMISSIONS = {
  tenant_admin: [
    'shops.read', 'shops.write',
    'stores.read', 'stores.write',
    'companies.read', 'companies.write', 'companies.delete',
    'categories.read', 'categories.write', 'categories.delete',
    'items.read', 'items.write', 'items.delete', 'items.transfer',
    'sales.read', 'sales.write', 'sales.delete',
    'orders.read', 'orders.write', 'orders.delete',
    'purchases.read', 'purchases.write', 'purchases.delete',
    'expenses.read', 'expenses.write', 'expenses.delete',
    'issues.read', 'issues.write', 'issues.delete',
  ],
  user: [
    'shops.read',
    'stores.read',
    'companies.read', 'companies.write', 'companies.delete',
    'categories.read', 'categories.write', 'categories.delete',
    'items.read', 'items.write', 'items.delete', 'items.transfer',
    'sales.read', 'sales.write', 'sales.delete',
    'orders.read', 'orders.write', 'orders.delete',
    'purchases.read', 'purchases.write', 'purchases.delete',
    'expenses.read', 'expenses.write', 'expenses.delete',
    'issues.read', 'issues.write', 'issues.delete',
  ],
};

export function hasPermission(permission, user = getUser()) {
  if (!user) {
    return false;
  }
  if (user.role === 'super_admin') {
    return true;
  }
  const fromRole = ROLE_PERMISSIONS[user.role] || [];
  return fromRole.includes(permission);
}

export function isAuthenticated() {
  return !!getToken() && !!getUser();
}

export function getAssignedShops(user = getUser()) {
  return Array.isArray(user?.shops) ? user.shops : [];
}

export function hasSingleAssignedShop(user = getUser()) {
  return user?.role === 'user' && getAssignedShops(user).length === 1;
}

export function defaultHomePath(user = getUser()) {
  if (!user) {
    return '/';
  }
  return '/home';
}

export function getViewTenantId() {
  return localStorage.getItem(TENANT_KEY);
}

export function setViewTenantId(id) {
  if (id) {
    localStorage.setItem(TENANT_KEY, String(id));
  } else {
    localStorage.removeItem(TENANT_KEY);
  }
  notifySession();
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySession();
}

export function updateStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifySession();
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TENANT_KEY);
  localStorage.removeItem(SHOP_KEY);
  notifySession();
}
