/** Strip leading "v" from release tags. */
export function normalizeVersionTag(tag: string): string {
  return tag.replace(/^v/i, '').trim();
}

/** True when `latest` is strictly newer than `current` (semver-ish). */
export function isVersionNewer(latest: string, current: string): boolean {
  const a = normalizeVersionTag(latest).split(/[.-]/).map((p) => parseInt(p, 10) || 0);
  const b = normalizeVersionTag(current).split(/[.-]/).map((p) => parseInt(p, 10) || 0);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return false;
}
