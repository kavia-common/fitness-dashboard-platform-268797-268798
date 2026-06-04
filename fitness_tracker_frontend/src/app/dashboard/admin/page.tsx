/**
 * @fileoverview Admin content management page (MVP).
 */

'use client';

import React, {useEffect, useState} from 'react';

import {apiRequest} from '@/lib/apiClient';
import {useMe} from '@/lib/auth';

type ContentItem = {
    id: string;
    kind: 'exercise' | 'plan_template' | 'tip';
    title: string;
    body: string;
    updatedAt: string;
};

// PUBLIC_INTERFACE
export default function AdminPage(): React.JSX.Element {
    /** Simple admin UI for managing content templates. */
    const {me} = useMe();
    const [items, setItems] = useState<ContentItem[]>([]);
    const [status, setStatus] = useState<string | null>(null);
    const [isBusy, setBusy] = useState(false);

    const [kind, setKind] = useState<ContentItem['kind']>('tip');
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');

    async function load(): Promise<void> {
        if (!me || me.role !== 'admin') {
            return;
        }
        try {
            const res = await apiRequest<ContentItem[]>('/admin/content', 'GET');
            setItems(res);
        } catch (e) {
            // ignore
        }
    }

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me?.role]);

    async function onCreate(): Promise<void> {
        setStatus(null);
        setBusy(true);
        try {
            await apiRequest('/admin/content', 'POST', {kind, title, body});
            setTitle('');
            setBody('');
            await load();
            setStatus('Created.');
        } catch (e) {
            setStatus('Failed. Ensure you are admin and backend is running.');
        } finally {
            setBusy(false);
        }
    }

    async function onDelete(id: string): Promise<void> {
        setStatus(null);
        setBusy(true);
        try {
            await apiRequest(`/admin/content/${encodeURIComponent(id)}`, 'DELETE');
            await load();
            setStatus('Deleted.');
        } catch (e) {
            setStatus('Delete failed.');
        } finally {
            setBusy(false);
        }
    }

    if (!me) {
        return (
            <div className="card">
                <div className="cardHeader">
                    <h1 style={{margin: 0}}>Admin</h1>
                    <p className="muted" style={{marginTop: 8}}>
                        Sign in as an admin to manage content.
                    </p>
                </div>
            </div>
        );
    }

    if (me.role !== 'admin') {
        return (
            <div className="card">
                <div className="cardHeader">
                    <h1 style={{margin: 0}}>Admin</h1>
                    <p className="muted" style={{marginTop: 8}}>
                        Access denied. Your account is not an admin.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="cardHeader">
                <h1 style={{margin: 0}}>Admin</h1>
                <p className="muted" style={{marginTop: 8}}>
                    Manage content templates used by plan generation (MVP).
                </p>
            </div>
            <div className="cardBody">
                <div className="grid2">
                    <div className="card" style={{padding: 16}}>
                        <div style={{fontWeight: 700}}>Create content</div>
                        <div style={{marginTop: 12}}>
                            <div className="label">Kind</div>
                            <select className="input" value={kind} onChange={(e) => setKind(e.target.value as ContentItem['kind'])}>
                                <option value="tip">Tip</option>
                                <option value="exercise">Exercise</option>
                                <option value="plan_template">Plan template</option>
                            </select>
                        </div>

                        <div style={{marginTop: 12}}>
                            <div className="label">Title</div>
                            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div style={{marginTop: 12}}>
                            <div className="label">Body</div>
                            <textarea
                                className="input"
                                style={{minHeight: 100}}
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                            />
                        </div>

                        <div style={{marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap'}}>
                            <button className="btn btnPrimary" disabled={isBusy || !title} onClick={onCreate}>
                                {isBusy ? 'Working…' : 'Create'}
                            </button>
                            {status && <span className="muted">{status}</span>}
                        </div>
                    </div>

                    <div className="card" style={{padding: 16}}>
                        <div style={{fontWeight: 700}}>Existing items</div>
                        <div className="muted" style={{marginTop: 6, fontSize: 13}}>
                            {items.length} item(s)
                        </div>

                        <div style={{marginTop: 12, display: 'grid', gap: 10}}>
                            {items.map((it) => (
                                <div
                                    key={it.id}
                                    style={{border: '1px solid var(--border)', borderRadius: 10, padding: 12}}
                                >
                                    <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
                                        <div style={{fontWeight: 700}}>{it.title}</div>
                                        <div className="badge">{it.kind}</div>
                                    </div>
                                    <div className="muted" style={{marginTop: 6, fontSize: 13, whiteSpace: 'pre-wrap'}}>
                                        {it.body}
                                    </div>
                                    <div style={{marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 12}}>
                                        <div className="muted" style={{fontSize: 12}}>
                                            Updated {new Date(it.updatedAt).toLocaleString()}
                                        </div>
                                        <button className="btn btnDanger" disabled={isBusy} onClick={() => onDelete(it.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {items.length === 0 && <div className="muted">No admin content found.</div>}
                        </div>
                    </div>
                </div>

                <div className="muted" style={{marginTop: 16, fontSize: 13, lineHeight: 1.6}}>
                    Backend expectations:
                    <code> GET /admin/content</code>, <code>POST /admin/content</code>, and
                    <code> DELETE /admin/content/:id</code> (admin-only).
                </div>
            </div>
        </div>
    );
}
