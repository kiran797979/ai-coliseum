export const truncateAddress = (addr: string): string => {
  if (!addr) return '';
  if (addr.length <= 10) return addr;
  return addr.slice(0, 6) + '...' + addr.slice(-4);
};

export const truncateAddressSafe = (addr: string | undefined | null): string => {
  if (!addr) return '';
  return truncateAddress(String(addr));
};

export const formatMON = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return '0 MON';
  return `${num.toFixed(2)} MON`;
};
