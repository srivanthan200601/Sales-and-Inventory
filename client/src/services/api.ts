import { config } from '../config/env';

export async function fetchFromApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  const json = await response.json();
  return json.data;
}
