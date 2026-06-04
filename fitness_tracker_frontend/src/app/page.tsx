/**
 * @fileoverview App landing page.
 */

import Link from 'next/link';
import React from 'react';

import {getApiBaseUrl, getWsUrl} from '@/lib/env';

// PUBLIC_INTERFACE
export default function HomePage(): React.JSX.Element {
    /** Landing page with quick links. */
    return (
        <div className="container">
            <div className="card">
                <div className="cardHeader">
                    <h1>Fitness Tracker</h1>
                    <p className="muted">
                        A dashboard-style fitness tracker (onboarding, goals, plans, logging, progress, admin).
                    </p>
                </div>
                <div className="cardBody">
                    <div className="grid2">
                        <div className="card" style={{padding: 16}}>
                            <h3>Get started</h3>
                            <p className="muted">Sign in to view your dashboard.</p>
                            <div style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                                <Link className="btn btnPrimary" href="/login">
                                    Login / Register
                                </Link>
                                <Link className="btn" href="/dashboard">
                                    Go to dashboard
                                </Link>
                            </div>
                        </div>
                        <div className="card" style={{padding: 16}}>
                            <h3>Environment</h3>
                            <div className="muted" style={{fontSize: 13, lineHeight: 1.6}}>
                                <div>
                                    <strong>API:</strong> {getApiBaseUrl()}
                                </div>
                                <div>
                                    <strong>WS:</strong> {getWsUrl()}
                                </div>
                            </div>
                            <p className="muted" style={{marginTop: 12}}>
                                Configure via <code>NEXT_PUBLIC_API_BASE</code>, <code>NEXT_PUBLIC_BACKEND_URL</code>,{' '}
                                and <code>NEXT_PUBLIC_WS_URL</code>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
