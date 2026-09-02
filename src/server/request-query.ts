const MAX_JSON_QUERY_PARAM_LENGTH = 10_000;
const MAX_ID_LIST_LENGTH = 200;

type IntegerParamOptions = {
  min?: number;
  max?: number;
};

export function getSearchParams(req: Request) {
  return new URL(req.url).searchParams;
}

export function parseIntegerParam(
  params: URLSearchParams,
  name: string,
  fallback: number,
  options: IntegerParamOptions = {}
) {
  const value = params.get(name);
  if (!value) return fallback;
  const trimmedValue = value.trim();
  if (!/^-?\d+$/.test(trimmedValue)) return fallback;

  const parsed = Number.parseInt(trimmedValue, 10);
  if (!Number.isSafeInteger(parsed)) return fallback;
  if (options.min !== undefined && parsed < options.min) return fallback;
  if (options.max !== undefined && parsed > options.max) return fallback;
  return parsed;
}

export function parseJsonParam<T>(params: URLSearchParams, name: string): T | undefined {
  const value = params.get(name);
  if (!value || value.length > MAX_JSON_QUERY_PARAM_LENGTH) return undefined;

  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return undefined;
    return parsed as T;
  } catch {
    return undefined;
  }
}

export function parseIdListParam(params: URLSearchParams, name: string) {
  const value = params.get(name);
  if (!value) return [];

  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id))
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isSafeInteger(id) && id > 0)
    .slice(0, MAX_ID_LIST_LENGTH);
}
