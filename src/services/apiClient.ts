const API_BASE_URL = 'http://localhost:8000/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isJsonBody = body !== undefined && !(body instanceof FormData) && typeof body !== 'string';

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...rest,
    body: body === undefined ? undefined : isJsonBody ? JSON.stringify(body) : body,
    headers: {
      Accept: 'application/json',
      ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload !== null && 'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(path, {
      ...options,
      method: 'GET',
    }),
  post: <T>(path: string, body?: Record<string, unknown>, options?: Omit<RequestOptions, 'body' | 'method'>) =>
    request<T>(path, {
      ...options,
      body,
      method: 'POST',
    }),
};
