/** Show decimals only when the value actually has them. 111 -> "111", 111.5 -> "111.5". */
export function formatAmount(value, empty = '0') {
  if (value === '' || value == null) {
    return empty;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return empty;
  }
  const rounded = Math.round((num + Number.EPSILON) * 1e6) / 1e6;
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

/** Keep in-progress typing (trailing ".") but strip padded API decimals like 111.00. */
export function formatInputAmount(value) {
  if (value === '' || value == null) {
    return '';
  }
  if (typeof value === 'string') {
    const raw = value.trim() === '' ? value : value;
    if (/[.\-]$/.test(raw) || raw === '.' || raw === '-.') {
      return raw;
    }
  }
  return formatAmount(value, '');
}

/** Keep empty / trailing "." while typing, and strip a stuck leading zero (01200 → 1200). */
export function sanitizeNumberTyping(value) {
  if (value === '' || value == null) {
    return '';
  }
  let raw = String(value).replace(/[^\d.\-]/g, '');
  if (raw === '-' || raw === '.' || raw === '-.') {
    return raw;
  }
  raw = raw.replace(/(?!^)-/g, '');
  const [sign, rest] = raw.startsWith('-') ? ['-', raw.slice(1)] : ['', raw];
  if (rest.includes('.')) {
    const [whole, ...fractionParts] = rest.split('.');
    const fraction = fractionParts.join('');
    const cleanedWhole = whole.replace(/^0+(?=\d)/, '') || (whole.length ? '0' : '');
    return `${sign}${cleanedWhole}.${fraction}`;
  }
  return `${sign}${rest.replace(/^0+(?=\d)/, '')}`;
}

export function displayEditableNumber(value, { allowZero = false } = {}) {
  if (value === '' || value == null) {
    return '';
  }
  if (typeof value === 'string') {
    if (/[.\-]$/.test(value) || value === '.' || value === '-.') {
      return value;
    }
    const sanitized = sanitizeNumberTyping(value);
    if (!allowZero && (sanitized === '0' || sanitized === '-0') && !sanitized.includes('.')) {
      return '';
    }
    return sanitized;
  }
  if (!allowZero && Number(value) === 0) {
    return '';
  }
  return formatInputAmount(value);
}
