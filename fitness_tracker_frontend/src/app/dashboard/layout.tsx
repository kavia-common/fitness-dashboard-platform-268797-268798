/**
 * @fileoverview Dashboard layout shell with nav and topbar.
 */

'use client';

import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import React, {useMemo, useState} from 'react';

import {logout, useMe} from '@/lib/auth';
import {useNotificationsWs} from '@/lib/ws';

type NavItem = {
    href: string;
    label: string;
};

function isActive(pathname: string, href: string): boolean {
    if (href === '/dashboard') {
        return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
}

function NavLink(props: {href: string; label: string}): React.JSX.Element {
    const pathname = usePathname();
    const active = isActive(pathname, props.href);
    return (
        <Link
            href={props.href}
            style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                background: active ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--muted)'
            }}
        >
            {props.label}
        </Link>
    );
}

// PUBLIC_INTERFACE
export default function DashboardLayout(props: {children: React.ReactNode}): React.JSX.Element {
    /** Provides the main dashboard navigation shell. */
    const router = useRouter();
    const {me, isLoading} = useMe();
    const [wsEnabled, setWsEnabled] = useState(true);
    const [showNotifs, setShowNotifs] = useState(false);

    const {connected, events, clear} = useNotificationsWs(wsEnabled);

    const navItems: NavItem[] = useMemo(() => {
        const items: NavItem[] = [
            {href: '/dashboard', label: 'Overview'},
            {href: '/dashboard/goals', label: 'Goals'},
            {href: '/dashboard/plan', label: 'Workout plan'},
            {href: '/dashboard/log', label: 'Log workout'},
            {href: '/dashboard/nutrition', label: 'Nutrition'},
            {href: '/dashboard/progress', label: 'Progress'}
        ];
        if (me?.role === 'admin') {
            items.push({href: '/dashboard/admin', label: 'Admin'});
        }
        return items;
    }, [me?.role]);

    return (
        <div style={{minHeight: '100vh', display: 'flex'}}>
            <aside
                className="card"
                style={{
                    width: 260,
                    margin: 16,
                    padding: 12,
                    position: 'sticky',
                    top: 16,
                    height: 'calc(100vh - 32px)',
                    overflow: 'auto'
                }}
            >
                <div style={{padding: 12}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div>
                            <div style={{fontWeight: 700}}>Fitness Tracker</div>
                            <div className="muted" style={{fontSize: 13}}>
                                Dashboard
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{padding: 12}}>
                    <div className="badge" style={{justifyContent: 'space-between', width: '100%'}}>
                        <span>Notifications</span>
                        <span style={{color: connected ? 'var(--secondary)' : 'var(--muted)'}}>
                            {connected ? 'WS on' : 'WS off'}
                        </span>
                    </div>
                    <div style={{display: 'flex', gap: 8, marginTop: 10}}>
                        <button className="btn" onClick={() => setShowNotifs((v) => !v)}>
                            {showNotifs ? 'Hide' : 'Show'}
                        </button>
                        <button className="btn" onClick={() => setWsEnabled((v) => !v)}>
                            {wsEnabled ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>

                <nav style={{display: 'grid', gap: 10, padding: 12}}>
                    {navItems.map((it) => (
                        <NavLink key={it.href} href={it.href} label={it.label} />
                    ))}
                </nav>

                <div style={{padding: 12}}>
                    <div className="card" style={{padding: 12}}>
                        <div style={{fontWeight: 600}}>Account</div>
                        <div className="muted" style={{fontSize: 13, marginTop: 6}}>
                            {isLoading ? 'Loading…' : me ? me.email : 'Not signed in'}
                        </div>
                        <div style={{display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap'}}>
                            {!me ? (
                                <Link className="btn btnPrimary" href="/login">
                                    Sign in
                                </Link>
                            ) : (
                                <>
                                    <button
                                        className="btn btnDanger"
                                        onClick={() => {
                                            logout();
                                            router.push('/login');
                                        }}
                                    >
                                        Logout
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            <main style={{flex: 1, minWidth: 0}}>
                <div className="container">
                    {showNotifs && (
                        <div className="card" style={{marginBottom: 16}}>
                            <div className="cardHeader">
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <h2 style={{margin: 0}}>Notifications</h2>
                                    <button className="btn" onClick={clear}>
                                        Clear
                                    </button>
                                </div>
                                <p className="muted" style={{marginTop: 8}}>
                                    Real-time events via WebSocket. (MVP: shows latest 50 messages.)
                                </p>
                            </div>
                            <div className="cardBody">
                                {events.length === 0 ? (
                                    <div className="muted">No events yet.</div>
                                ) : (
                                    <div style={{display: 'grid', gap: 10}}>
                                        {events.map((e) => (
                                            <div
                                                key={e.id}
                                                style={{
                                                    border: '1px solid var(--border)',
                                                    borderRadius: 10,
                                                    padding: 12
                                                }}
                                            >
                                                <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
                                                    <div style={{fontWeight: 600}}>{e.title}</div>
                                                    <div className="muted" style={{fontSize: 12}}>
                                                        {new Date(e.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="muted" style={{marginTop: 6}}>
                                                    {e.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {props.children}
                </div>
            </main>
        </div>
    );
}
