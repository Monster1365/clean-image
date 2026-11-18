export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function replaceExtension(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base}.${ext}`;
}

/** Percentage change from `from` to `to`, e.g. -42 for a 42% reduction. */
export function sizeChange(from: number, to: number): number {
  if (from === 0) return 0;
  return Math.round(((to - from) / from) * 100);
}
