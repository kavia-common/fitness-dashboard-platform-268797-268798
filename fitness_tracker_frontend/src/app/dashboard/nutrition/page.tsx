/**
 * @fileoverview Nutrition logging page (optional MVP).
 */

'use client';

import React, {useState} from 'react';

import {apiRequest} from '@/lib/apiClient';
import {useMe} from '@/lib/auth';

// PUBLIC_INTERFACE
export default function NutritionPage(): React.JSX.Element {
    /** Lets the user log basic nutrition entries. */
    const {me} = useMe();

    const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    const [calories, setCalories] = useState<string>('');
    const [proteinG, setProteinG] = useState<string>('');
    const [notes, setNotes] = useState('');

    const [status, setStatus] = useState<string | null>(null);
    const [isSaving, setSaving] = useState(false);

    async function onSave(): Promise<void> {
        setStatus(null);
        setSaving(true);
        try {
            await apiRequest('/logs/nutrition', 'POST', {
                date: new Date(date).toISOString(),
                calories: calories ? Number(calories) : undefined,
                proteinG: proteinG ? Number(proteinG) : undefined,
                notes: notes || undefined
            });
            setStatus('Nutrition logged.');
            setCalories('');
            setProteinG('');
            setNotes('');
        } catch (e) {
            setStatus('Failed to log nutrition. Ensure you are signed in and backend is running.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card">
            <div className="cardHeader">
                <h1 style={{margin: 0}}>Nutrition</h1>
                <p className="muted" style={{marginTop: 8}}>
                    Optional: track calories and protein to support your goal.
                </p>
            </div>
            <div className="cardBody">
                {!me && (
                    <div className="card" style={{padding: 16, borderColor: 'rgba(245, 158, 11, 0.35)'}}>
                        <div style={{fontWeight: 700}}>Sign in required</div>
                        <div className="muted" style={{marginTop: 8}}>
                            Nutrition logs are stored in your account. Please sign in first.
                        </div>
                    </div>
                )}

                <div className="grid2" style={{marginTop: 12}}>
                    <div>
                        <div className="label">Date</div>
                        <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    </div>
                    <div>
                        <div className="label">Calories</div>
                        <input
                            className="input"
                            type="number"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            placeholder="e.g., 2100"
                        />
                    </div>
                </div>

                <div className="grid2" style={{marginTop: 16}}>
                    <div>
                        <div className="label">Protein (g)</div>
                        <input
                            className="input"
                            type="number"
                            value={proteinG}
                            onChange={(e) => setProteinG(e.target.value)}
                            placeholder="e.g., 130"
                        />
                    </div>
                    <div>
                        <div className="label">Notes (optional)</div>
                        <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                </div>

                <div style={{marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
                    <button className="btn btnPrimary" disabled={!me || isSaving} onClick={onSave}>
                        {isSaving ? 'Saving…' : 'Save log'}
                    </button>
                    {status && <span className="muted">{status}</span>}
                </div>

                <div className="muted" style={{marginTop: 16, fontSize: 13, lineHeight: 1.6}}>
                    Backend expectations:
                    <code> POST /logs/nutrition</code>.
                </div>
            </div>
        </div>
    );
}
