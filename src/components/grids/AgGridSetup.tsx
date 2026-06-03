/**
 * One-time AG Grid Enterprise registration.
 *
 * Mounted once at the application root. Applies the license key from
 * NEXT_PUBLIC_AG_GRID_LICENSE when present; in development the key is absent and
 * Community features (options chain, positions, history) work fully — only
 * Enterprise extras (row grouping / pivoting in the strategy library) show the
 * usual watermark. Renders nothing.
 */

'use client';

import { LicenseManager } from 'ag-grid-enterprise';

const key = process.env.NEXT_PUBLIC_AG_GRID_LICENSE;
if (key) {
  LicenseManager.setLicenseKey(key);
}

export function AgGridSetup(): null {
  return null;
}
