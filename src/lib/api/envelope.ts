/** Standard Go API response envelope. */
export type ApiEnvelope<T> = {
  data: T;
  as_of: string;
  source: string;
};

export function envelope<T>(data: T, source: string): ApiEnvelope<T> {
  return { data, as_of: new Date().toISOString(), source };
}
