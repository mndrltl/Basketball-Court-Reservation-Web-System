export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readFieldErrors(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  );
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export async function apiRequest(path: string, options: RequestInit = {}): Promise<unknown> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers,
      credentials: 'include'
    });
  } catch {
    throw new ApiError(
      0,
      'Unable to reach the authentication API. Check that the backend is current and its CORS origin is configured.'
    );
  }

  let payload: unknown;
  try {
    const responseText = await response.text();
    payload = responseText ? JSON.parse(responseText) : undefined;
  } catch {
    if (response.ok) {
      throw new ApiError(response.status, 'The server returned an invalid response.');
    }
  }

  if (!response.ok) {
    const body = isRecord(payload) ? payload : {};
    const message = typeof body.message === 'string'
      ? body.message
      : `The server returned an unexpected response (${response.status}).`;
    throw new ApiError(response.status, message, readFieldErrors(body.errors));
  }

  return payload;
}
