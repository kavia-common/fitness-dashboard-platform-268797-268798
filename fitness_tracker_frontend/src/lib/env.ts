/**
 * @fileoverview Environment variable accessors for the frontend.
 */

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
    const url = (value && value.trim()) ? value.trim() : fallback;
    return url.endsWith('/') ? url.slice(0, -1) : url;
}

// PUBLIC_INTERFACE
export function getApiBaseUrl(): string {
    /**
     * Returns the API base URL for REST calls.
     *
     * Order:
     * - NEXT_PUBLIC_API_BASE (preferred)
     * - NEXT_PUBLIC_BACKEND_URL (fallback)
     * - default to http://localhost:3001 for local dev
     */
    const apiBase = process.env.NEXT_PUBLIC_API_BASE;
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    return normalizeBaseUrl(apiBase || backendUrl, 'http://localhost:3001');
}

// PUBLIC_INTERFACE
export function getWsUrl(): string {
    /**
     * Returns the WebSocket base URL.
     *
     * - NEXT_PUBLIC_WS_URL (preferred)
     * - otherwise derived from API base (http->ws, https->wss) with /ws suffix
     */
    const explicit = process.env.NEXT_PUBLIC_WS_URL;
    if (explicit && explicit.trim()) {
        return normalizeBaseUrl(explicit, explicit);
    }
    const apiBase = getApiBaseUrl();
    const derived = apiBase.startsWith('https://')
        ? apiBase.replace('https://', 'wss://')
        : apiBase.replace('http://', 'ws://');
    return `${normalizeBaseUrl(derived, derived)}/ws`;
}

// PUBLIC_INTERFACE
export function getFrontendUrl(): string {
    /**
     * Returns the frontend's public base URL if provided (used for links).
     */
    const value = process.env.NEXT_PUBLIC_FRONTEND_URL;
    return normalizeBaseUrl(value, 'http://localhost:3000');
}
