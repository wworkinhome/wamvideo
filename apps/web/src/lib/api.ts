const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message ?? 'Error de red');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, token?: string | null) => request<T>(path, { method: 'GET', token }),
  post: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined, token }),
  put: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, token }),
  patch: <T>(path: string, body?: unknown, token?: string | null) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined, token }),
  delete: <T>(path: string, token?: string | null) => request<T>(path, { method: 'DELETE', token }),
};

export interface Genre {
  id: string;
  name: string;
}

export interface Movie {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  releaseYear: number | null;
  durationMinutes: number | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  videoUrl: string;
  isPremium: boolean;
  genres: Genre[];
}

export interface Episode {
  id: string;
  number: number;
  title: string;
  synopsis: string | null;
  durationMinutes: number | null;
  videoUrl: string;
}

export interface Season {
  id: string;
  number: number;
  title: string | null;
  episodes: Episode[];
}

export interface Series {
  id: string;
  title: string;
  slug: string;
  synopsis: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  isPremium: boolean;
  genres: Genre[];
  seasons: Season[];
}

export interface Favorite {
  id: string;
  movie: Movie | null;
  series: Series | null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
