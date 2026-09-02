type QueryValue = string | number | boolean | object | null | undefined;

export function buildApiQuery(params: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (typeof value === "object") {
      searchParams.set(key, JSON.stringify(value));
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
