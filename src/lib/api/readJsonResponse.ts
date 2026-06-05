/** Safely parse a fetch Response as JSON; rejects HTML error pages (Vercel 504, etc.). */
export async function readJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trimStart();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    throw new Error(
      res.ok
        ? 'invalid response from market API'
        : `market API error (${res.status})`,
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`market API error (${res.status})`);
  }
}
