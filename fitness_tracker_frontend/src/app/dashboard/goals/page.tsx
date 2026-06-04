/**
 * @fileoverview Goals page.
 */

'use client';

import React, {useEffect, useState} from 'react';

import {apiRequest} from '@/lib/apiClient';
import {useMe} from '@/lib/auth';
import {Goal, GoalType} from '@/lib/types';

const GOAL_LABELS: Record<GoalType, string> = {
    weight_loss: 'Weight loss',
    strength: 'Strength',
    endurance: 'Endurance',
    general_health: 'General health'
};

// PUBLIC_INTERFACE
export default function GoalsPage(): React.JSX.Element {
    /** Allows user to set and view active goal. */
    const {me} = useMe();
    const [active, setActive] = useState<Goal | null>(null);

    const [type, setType] = useState<GoalType>('general_health');
    const [targetValue, setTargetValue] = useState<string>('');
    const [targetUnit, setTargetUnit] = useState<string>('kg');
    const [endDate, setEndDate] = useState<string>('');

    const [status, setStatus] = useState<string | null>(null);
    const [isSaving, setSaving] = useState(false);

    useEffect(() => {
        let isCancelled = false;

        async function load(): Promise<void> {
            if (!me) {
                return;
            }
            try {
                const g = await apiRequest<Goal | null>('/goals/active', 'GET');
                if (isCancelled) {
                    return;
                }
                setActive(g);
                if (g) {
                    setType(g.type);
                    setTargetValue(g.targetValue !== undefined ? String(g.targetValue) : '');
                    setTargetUnit(g.targetUnit || 'kg');
                    setEndDate(g.endDate ? g.endDate.slice(0, 10) : '');
                }
            } catch (e) {
                // ignore
            }
        }

        void load();
        return () => {
            isCancelled = true;
        };
    }, [me]);

    async function onSave(): Promise<void> {
        setStatus(null);
        setSaving(true);
        try {
            await apiRequest<Goal>('/goals', 'POST', {
                type,
                targetValue: targetValue ? Number(targetValue) : undefined,
                targetUnit: targetValue ? targetUnit : undefined,
                endDate: endDate ? new Date(endDate).toISOString() : undefined
            });
            const refreshed = await apiRequest<Goal | null>('/goals/active', 'GET');
            setActive(refreshed);
            setStatus('Goal saved.');
        } catch (e) {
            setStatus('Failed to save goal. Ensure you are signed in and backend is running.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card">
            <div className="cardHeader">
                <h1 style={{margin: 0}}>Goals</h1>
                <p className="muted" style={{marginTop: 8}}>
                    Set a clear goal so your plan can adapt.
                </p>
            </div>
            <div className="cardBody">
                {!me && (
                    <div className="card" style={{padding: 16, borderColor: 'rgba(245, 158, 11, 0.35)'}}>
                        <div style={{fontWeight: 700}}>Sign in required</div>
                        <div className="muted" style={{marginTop: 8}}>
                            Goals are stored in your profile. Please sign in first.
                        </div>
                    </div>
                )}

                {active && (
                    <div className="card" style={{padding: 16, marginTop: 12}}>
                        <div style={{fontWeight: 700}}>Active goal</div>
                        <div className="muted" style={{marginTop: 8}}>
                            {GOAL_LABELS[active.type]}
                            {active.targetValue !== undefined ? ` — target ${active.targetValue} ${active.targetUnit || ''}` : ''}
                        </div>
                    </div>
                )}

                <div className="grid2" style={{marginTop: 16}}>
                    <div>
                        <div className="label">Goal type</div>
                        <select className="input" value={type} onChange={(e) => setType(e.target.value as GoalType)}>
                            {Object.entries(GOAL_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="label">End date (optional)</div>
                        <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                <div className="grid2" style={{marginTop: 16}}>
                    <div>
                        <div className="label">Target value (optional)</div>
                        <input
                            className="input"
                            type="number"
                            value={targetValue}
                            onChange={(e) => setTargetValue(e.target.value)}
                            placeholder="e.g., 70"
                        />
                    </div>

                    <div>
                        <div className="label">Target unit</div>
                        <input className="input" value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)} />
                    </div>
                </div>

                <div style={{marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
                    <button className="btn btnPrimary" disabled={!me || isSaving} onClick={onSave}>
                        {isSaving ? 'Saving…' : 'Save goal'}
                    </button>
                    {status && <span className="muted">{status}</span>}
                </div>

                <div className="muted" style={{marginTop: 16, fontSize: 13, lineHeight: 1.6}}>
                    Backend expectations:
                    <code> GET /goals/active</code> and <code>POST /goals</code>.
                </div>
            </div>
        </div>
    );
}
