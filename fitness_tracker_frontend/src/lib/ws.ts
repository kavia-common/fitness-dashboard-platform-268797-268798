/**
 * @fileoverview WebSocket client for receiving real-time notification events.
 */

import {useEffect, useMemo, useRef, useState} from 'react';

import {getWsUrl} from '@/lib/env';

export type NotificationEvent = {
    id: string;
    type: 'reminder' | 'streak' | 'system' | 'plan_update';
    title: string;
    message: string;
    createdAt: string;
};

type BackendNotification = {
    id: string;
    type: 'reminder' | 'system' | 'achievement';
    title: string;
    message: string;
    payload?: Record<string, unknown>;
    is_read?: boolean;
    created_at: string;
};

type BackendWsEnvelope =
    | {
          type: 'notification.created';
          notification: BackendNotification;
      }
    | Record<string, unknown>;

function getAuthToken(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.localStorage.getItem('ft_token');
}

function toNotificationEvent(envelope: BackendWsEnvelope): NotificationEvent | null {
    if (!envelope || typeof envelope !== 'object') {
        return null;
    }
    const maybeType = (envelope as {type?: unknown}).type;
    if (maybeType !== 'notification.created') {
        return null;
    }
    const notification = (envelope as {notification?: BackendNotification}).notification;
    if (!notification) {
        return null;
    }

    // Map backend types to UI types (UI uses a slightly different taxonomy).
    const mappedType: NotificationEvent['type'] =
        notification.type === 'achievement'
            ? 'streak'
            : notification.type === 'reminder'
              ? 'reminder'
              : 'system';

    return {
        id: notification.id,
        type: mappedType,
        title: notification.title,
        message: notification.message,
        createdAt: notification.created_at
    };
}

// PUBLIC_INTERFACE
export function useNotificationsWs(isEnabled: boolean): {
    connected: boolean;
    events: NotificationEvent[];
    clear: () => void;
} {
    /**
     * React hook to connect to backend WebSocket and collect notification events.
     *
     * The backend is expected to emit JSON messages of shape NotificationEvent.
     */
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState<NotificationEvent[]>([]);
    const wsRef = useRef<WebSocket | null>(null);

    const url = useMemo(() => getWsUrl(), []);

    useEffect(() => {
        if (!isEnabled) {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            setConnected(false);
            return;
        }

        let isCancelled = false;
        const token = getAuthToken();
        if (!token) {
            // Not authenticated yet; don't attempt to connect.
            setConnected(false);
            return;
        }

        // Backend expects: /ws/notifications?token=<JWT>
        const wsUrl = `${url}/notifications?token=${encodeURIComponent(token)}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            if (isCancelled) {
                return;
            }
            setConnected(true);
        };

        ws.onclose = () => {
            if (isCancelled) {
                return;
            }
            setConnected(false);
        };

        ws.onerror = () => {
            if (isCancelled) {
                return;
            }
            setConnected(false);
        };

        ws.onmessage = (evt) => {
            if (isCancelled) {
                return;
            }
            try {
                const parsed = JSON.parse(evt.data as string) as BackendWsEnvelope;
                const event = toNotificationEvent(parsed);
                if (!event) {
                    return;
                }
                setEvents((prev) => [event, ...prev].slice(0, 50));
            } catch (e) {
                // Ignore malformed messages.
            }
        };

        return () => {
            isCancelled = true;
            ws.close();
        };
    }, [isEnabled, url]);

    return {
        connected,
        events,
        clear: () => setEvents([])
    };
}
