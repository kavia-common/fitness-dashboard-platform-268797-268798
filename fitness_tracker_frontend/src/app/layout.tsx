/**
 * @fileoverview Root app layout.
 */

import type {Metadata} from 'next';
import React from 'react';

import './globals.css';

export const metadata: Metadata = {
    title: 'Fitness Tracker',
    description: 'Personalized fitness tracker dashboard'
};

// PUBLIC_INTERFACE
export default function RootLayout(props: {children: React.ReactNode}): React.JSX.Element {
    /** Root HTML layout wrapper. */
    return (
        <html lang="en">
            <body>{props.children}</body>
        </html>
    );
}
