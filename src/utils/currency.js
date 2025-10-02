/**
 * currency(n, opts?)
 * Formats a number with locale-aware separators and 2 decimal places by default.
 *
 * Examples:
 *   currency(1234.5) -> "1,234.50"
 *   currency(1234.5, { style: "currency", currency: "ETB" }) -> "ETB 1,234.50"
 */
export const currency = (n, opts = {}) => {
  const num = Number.isFinite(n) ? Number(n) : Number(n || 0);
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    ...rest
  } = opts;

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits,
    maximumFractionDigits,
    ...rest,
  }).format(num);
};

export default currency;
