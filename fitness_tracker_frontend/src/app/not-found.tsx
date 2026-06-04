/**
 * @fileoverview Not found page.
 */

import Link from 'next/link';
import React from 'react';

// PUBLIC_INTERFACE
export default function NotFound(): React.JSX.Element {
    /** Rendered for unknown routes. */
    return (
        <div className="container">
            <div className="card" style={{maxWidth: 680, margin: '40px auto'}}>
                <div className="cardHeader">
                    <h1 style={{margin: 0}}>Page not found</h1>
                    <p className="muted" style={{marginTop: 8}}>
                        The page you requested does not exist.
                    </p>
                </div>
                <div className="cardBody" style={{display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                    <Link className="btn btnPrimary" href="/dashboard">
                        Dashboard
                    </Link>
                    <Link className="btn" href="/">
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
