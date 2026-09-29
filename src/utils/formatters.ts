export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  return dateTimeStr;
}

export function generateVietQrUrl(params: {
  bankCode?: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
}): string {
  const bank = params.bankCode || 'MB';
  const cleanDesc = encodeURIComponent(params.description.slice(0, 50));
  return `https://img.vietqr.io/image/${bank}-${params.accountNumber}-compact2.png?amount=${params.amount}&addInfo=${cleanDesc}&accountName=${encodeURIComponent(params.accountName)}`;
}
