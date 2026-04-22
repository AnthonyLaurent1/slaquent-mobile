import { API_BASE_URL, SERVER_CONFIG_ERROR } from '@/lib/env';
import { AppError } from '@/lib/errors';

type JsonBody = Record<string, unknown> | unknown[];

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: JsonBody;
};

export async function fetchWithJson<T>(path: string, options: ApiOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new AppError('SERVER_URL_MISSING', SERVER_CONFIG_ERROR ?? undefined);
  }

  const { body, headers, ...restOptions } = options;

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...restOptions,
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok) {
      let errorCode = 'UNKNOWN_ERROR';

      try {
        const payload = (await response.json()) as { error?: string };
        errorCode = payload.error ?? errorCode;
      } catch {
        errorCode = 'UNKNOWN_ERROR';
      }

      throw new AppError(errorCode);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('NETWORK_ERROR');
  }
}
