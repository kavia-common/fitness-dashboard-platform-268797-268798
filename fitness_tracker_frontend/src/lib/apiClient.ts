/**
 * @fileoverview Minimal fetch wrapper for backend API access.
 */

import {getApiBaseUrl} from '@/lib/env';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
    readonly status: number;
    readonly detail?: unknown;

    constructor(message: string, status: number, detail?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.detail = detail;
    }
}

function getAuthToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.localStorage.getItem('ft_token');
}

function buildUrl(path: string): string {
    const base = getApiBaseUrl();
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
}

// PUBLIC_INTERFACE
export async function apiRequest<T>(
    path: string,
    method: HttpMethod,
    body?: unknown,
    init?: RequestInit
): Promise<T> {
    /**
     * Performs an authenticated API request.
     *
     * @param path endpoint path, e.g. "/api/me"
     * @param method HTTP method
     * @param body optional JSON body
     * @param init optional fetch init overrides
     * @return parsed JSON response
     * @throws ApiError for non-2xx responses
     */
    const url = buildUrl(path);

    const headers = new Headers(init?.headers || {});
    headers.set('Accept', 'application/json');
    if (body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }

    const token = getAuthToken();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const res = await fetch(url, {
        ...init,
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: 'no-store'
    });

    if (!res.ok) {
        let detail: unknown = undefined;
        try {
            detail = await res.json();
        } catch (e) {
            detail = await res.text();
        }
        throw new ApiError(`API request failed: ${method} ${path}`, res.status, detail);
    }

    if (res.status === 204) {
        return undefined as unknown as T;
    }
    return /** @type {T} */ (await res.json());
}
