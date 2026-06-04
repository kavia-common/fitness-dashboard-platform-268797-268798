/**
 * @fileoverview Workout logging page.
 */

'use client';

import React, {useState} from 'react';

import {apiRequest} from '@/lib/apiClient';
import {useMe} from '@/lib/auth';

// PUBLIC_INTERFACE
export default function WorkoutLogPage(): React.JSX.Element {
    /** Lets the user log a workout session. */
    const {me} = useMe();

    const [workoutName, setWorkoutName] = useState('');
    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [durationMin, setDurationMin] = useState<string>('30');
    const [notes, setNotes] = useState('');

    const [status, setStatus] = useState<string | null>(null);
    const [isSaving, setSaving] = useState(false);

    async function onSave(): Promise<void> {
        setStatus(null);
        setSaving(true);
        try {
            await apiRequest('/logs/workouts', 'POST', {
                date: new Date(date).toISOString(),
                workoutName,
                durationMin: durationMin ? Number(durationMin) : undefined,
                notes: notes || undefined
            });
            setStatus('Workout logged.');
            setWorkoutName('');
            setNotes('');
        } catch (e) {
            setStatus('Failed to log workout. Ensure you are signed in and backend is running.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card">
            <div className="cardHeader">
                <h1 style={{margin: 0}}>Log workout</h1>
                <p className="muted" style={{marginTop: 8}}>
                    Logging builds your streak and improves progress analytics.
                </p>
            </div>
            <div className="cardBody">
                {!me && (
                    <div className="card" style={{padding: 16, borderColor: 'rgba(245, 158, 11, 0.35)'}}>
                        <div style={{fontWeight: 700}}>Sign in required</div>
                        <div className="muted" style={{marginTop: 8}}>
                            Logs are stored in your account. Please sign in first.
                        </div>
                    </div>
                )}

                <div className="grid2" style={{marginTop: 12}}>
                    <div>
                        <div className="label">Workout name</div>
                        <input
                            className="input"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            placeholder="e.g., Full body strength"
                        />
                    </div>
                    <div>
                        <div className="label">Date</div>
                        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                </div>

                <div className="grid2" style={{marginTop: 16}}>
                    <div>
                        <div className="label">Duration (minutes)</div>
                        <input
                            className="input"
                            type="number"
                            min={1}
                            max={300}
                            value={durationMin}
                            onChange={(e) => setDurationMin(e.target.value)}
                        />
                    </div>
                    <div>
                        <div className="label">Notes (optional)</div>
                        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>

                <div style={{marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
                    <button className="btn btnPrimary" disabled={!me || isSaving || !workoutName} onClick={onSave}>
                        {isSaving ? 'Saving…' : 'Save log'}
                    </button>
                    {status && <span className="muted">{status}</span>}
                </div>

                <div className="muted" style={{marginTop: 16, fontSize: 13, lineHeight: 1.6}}>
                    Backend expectations:
                    <code> POST /logs/workouts</code>.
                </div>
            </div>
        </div>
    );
}
