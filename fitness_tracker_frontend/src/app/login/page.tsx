/**
 * @fileoverview Login / register page.
 */

'use client';

import React, {useState} from 'react';

import {login, register, useMe} from '@/lib/auth';

type Mode = 'login' | 'register';

function InputRow(props: {
    label: string;
    value: string;
    type?: string;
    onChange: (v: string) => void;
}): React.JSX.Element {
    return (
        <div style={{marginBottom: 12}}>
            <div className="label">{props.label}</div>
            <input
                className="input"
                value={props.value}
                type={props.type || 'text'}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    );
}

// PUBLIC_INTERFACE
export default function LoginPage(): React.JSX.Element {
    /** Auth screen for login/register. */
    const {me, refresh} = useMe();
    const [mode, setMode] = useState<Mode>('login');

    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setSubmitting] = useState(false);

    async function onSubmit(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(email, password, displayName || email.split('@')[0] || 'User');
            }
            await refresh();
            window.location.href = '/dashboard';
        } catch (err) {
            setError('Authentication failed. Ensure backend is running and credentials are valid.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="container">
            <div className="card" style={{maxWidth: 520, margin: '40px auto'}}>
                <div className="cardHeader">
                    <h1 style={{margin: 0}}>Sign in</h1>
                    <p className="muted" style={{marginTop: 8}}>
                        {me ? `Already signed in as ${me.email}.` : 'Login or create an account to continue.'}
                    </p>
                </div>
                <div className="cardBody">
                    <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
                        <button
                            className={`btn ${mode === 'login' ? 'btnPrimary' : ''}`}
                            onClick={() => setMode('login')}
                            type="button"
                        >
                            Login
                        </button>
                        <button
                            className={`btn ${mode === 'register' ? 'btnPrimary' : ''}`}
                            onClick={() => setMode('register')}
                            type="button"
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={onSubmit}>
                        <InputRow label="Email" value={email} type="email" onChange={setEmail} />
                        {mode === 'register' && (
                            <InputRow label="Display name" value={displayName} onChange={setDisplayName} />
                        )}
                        <InputRow label="Password" value={password} type="password" onChange={setPassword} />

                        {error && (
                            <div style={{color: 'var(--danger)', marginBottom: 12, fontSize: 13}}>{error}</div>
                        )}

                        <button className="btn btnPrimary" disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Submitting…' : mode === 'login' ? 'Login' : 'Create account'}
                        </button>
                    </form>

                    <div className="muted" style={{marginTop: 16, fontSize: 13, lineHeight: 1.6}}>
                        <div>
                            This demo UI expects backend endpoints:
                            <code> POST /auth/login</code>, <code>POST /auth/register</code>, and <code>GET /api/me</code>.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
