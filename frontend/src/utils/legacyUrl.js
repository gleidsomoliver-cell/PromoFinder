export function legacyUrl(page) {
  const base = import.meta.env.VITE_LEGACY_BASE_URL || '/legacy/';
  return `${base.replace(/\/$/, '')}/${page}`;
}
