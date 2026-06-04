/**
 * @fileoverview Authentication helpers.
 */

import useSWR from 'swr';

import {apiRequest} from '@/lib/apiClient';
import {UserProfile} from '@/lib/types';

const ME_KEY = '/api/me';

function readToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.localStorage.getItem('ft_token');
}

function setToken(token: string | null): void {
    if (typeof window === 'undefined') {
        return;
    }
    if (token) {
        window.localStorage.setItem('ft_token', token);
    } else {
        window.localStorage.removeItem('ft_token');
    }
}

// PUBLIC_INTERFACE
export function useMe(): {
    me?: UserProfile;
    isLoading: boolean;
    error?: unknown;
    refresh: () => Promise<void>;
} {
    /**
     * Fetches current logged-in user profile from backend.
     */
    const token = readToken();
    const {data, error, isLoading, mutate} = useSWR<UserProfile>(
        token ? ME_KEY : null,
        async () => apiRequest<UserProfile>(ME_KEY, 'GET')
    );

    return {
        me: data,
        isLoading,
        error,
        refresh: async () => {
            await mutate();
        }
    };
}

// PUBLIC_INTERFACE
export async function login(email: string, password: string): Promise<void> {
    /**
     * Logs in and stores the auth token.
     */
    const res = await apiRequest<{token: string}>('/auth/login', 'POST', {email, password});
    setToken(res.token);
}

// PUBLIC_INTERFACE
export async function register(email: string, password: string, displayName: string): Promise<void> {
    /**
     * Registers and stores the auth token.
     */
    const res = await apiRequest<{token: string}>('/auth/register', 'POST', {email, password, displayName});
    setToken(res.token);
}

// PUBLIC_INTERFACE
export function logout(): void {
    /**
     * Logs out by removing local token.
     */
    setToken(null);
}
