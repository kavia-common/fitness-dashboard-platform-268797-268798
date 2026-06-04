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
        const ws = new WebSocket(url);
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
                const parsed = JSON.parse(evt.data as string) as NotificationEvent;
                setEvents((prev) => [parsed, ...prev].slice(0, 50));
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
