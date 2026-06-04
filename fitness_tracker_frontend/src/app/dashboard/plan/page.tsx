/**
 * @fileoverview Workout plan page.
 */

'use client';

import React, {useEffect, useState} from 'react';

import {apiRequest} from '@/lib/apiClient';
import {useMe} from '@/lib/auth';
import {WorkoutPlan} from '@/lib/types';

function PlanDayCard(props: {dayLabel: string; focus: string; items: Array<{name: string; detail: string}>}): React.JSX.Element {
    return (
        <div className="card" style={{padding: 16}}>
            <div style={{display: 'flex', justifyContent: 'space-between', gap: 12}}>
                <div style={{fontWeight: 800}}>{props.dayLabel}</div>
                <div className="badge">{props.focus}</div>
            </div>
            <div style={{marginTop: 12, display: 'grid', gap: 8}}>
                {props.items.map((it, idx) => (
                    <div
                        key={`${it.name}-${idx}`}
                        style={{border: '1px solid var(--border)', borderRadius: 10, padding: 10}}
                    >
                        <div style={{fontWeight: 700}}>{it.name}</div>
                        <div className="muted" style={{fontSize: 13, marginTop: 4}}>
                            {it.detail}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// PUBLIC_INTERFACE
export default function PlanPage(): React.JSX.Element {
    /** Displays current personalized plan. */
    const {me} = useMe();
    const [plan, setPlan] = useState<WorkoutPlan | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [isBusy, setBusy] = useState(false);

    async function load(): Promise<void> {
        if (!me) {
            return;
        }
        try {
            const res = await apiRequest<WorkoutPlan | null>('/plans/current', 'GET');
            setPlan(res);
        } catch (e) {
            // ignore
        }
    }

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [me]);

    async function onRegenerate(): Promise<void> {
        setStatus(null);
        setBusy(true);
        try {
            await apiRequest('/plans/generate', 'POST', {});
            await load();
            setStatus('Plan refreshed.');
        } catch (e) {
            setStatus('Failed to regenerate plan. Complete onboarding and ensure backend is available.');
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="card">
            <div className="cardHeader">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12}}>
                    <div>
                        <h1 style={{margin: 0}}>Workout plan</h1>
                        <p className="muted" style={{marginTop: 8}}>
                            Your plan is generated from your level, goal, and preferences.
                        </p>
                    </div>
                    <button className="btn btnPrimary" disabled={!me || isBusy} onClick={onRegenerate}>
                        {isBusy ? 'Working…' : 'Regenerate'}
                    </button>
                </div>
                {status && (
                    <p className="muted" style={{marginTop: 8}}>
                        {status}
                    </p>
                )}
            </div>
            <div className="cardBody">
                {!me && (
                    <div className="card" style={{padding: 16, borderColor: 'rgba(245, 158, 11, 0.35)'}}>
                        <div style={{fontWeight: 700}}>Sign in required</div>
                        <div className="muted" style={{marginTop: 8}}>
                            Plans are stored in your account. Please sign in first.
                        </div>
                    </div>
                )}

                {me && !plan && (
                    <div className="card" style={{padding: 16}}>
                        <div className="muted">No plan found.</div>
                        <div className="muted" style={{marginTop: 8}}>
                            Complete onboarding to generate your first plan.
                        </div>
                    </div>
                )}

                {plan && (
                    <div>
                        <div style={{display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
                            <div className="badge">Updated {new Date(plan.createdAt).toLocaleString()}</div>
                            <div className="muted">{plan.summary}</div>
                        </div>

                        <div className="grid2" style={{marginTop: 16}}>
                            {plan.days.map((d) => (
                                <PlanDayCard
                                    key={d.dayLabel}
                                    dayLabel={d.dayLabel}
                                    focus={d.focus}
                                    items={d.exercises.map((ex) => {
                                        const bits: string[] = [];
                                        if (ex.sets !== undefined && ex.reps) {
                                            bits.push(`${ex.sets} sets × ${ex.reps}`);
                                        }
                                        if (ex.durationMin !== undefined) {
                                            bits.push(`${ex.durationMin} min`);
                                        }
                                        if (ex.notes) {
                                            bits.push(ex.notes);
                                        }
                                        return {
                                            name: ex.name,
                                            detail: bits.length ? bits.join(' • ') : '—'
                                        };
                                    })}
                                />
                            ))}
                        </div>

                        <div className="muted" style={{marginTop: 16, fontSize: 13, lineHeight: 1.6}}>
                            Backend expectations:
                            <code> GET /plans/current</code> and <code>POST /plans/generate</code>.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
