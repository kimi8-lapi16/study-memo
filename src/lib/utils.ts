/** base path（/study-memo/）を考慮してパスを結合する */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

/** YYYY-MM-DD 形式に整形 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
