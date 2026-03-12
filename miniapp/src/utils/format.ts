export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatPrice(n: number, currency?: string): string {
  const formatted = new Intl.NumberFormat('uz-UZ').format(n)
  if (currency && currency !== 'UZS') return `${formatted} ${currency}`
  return formatted
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}
