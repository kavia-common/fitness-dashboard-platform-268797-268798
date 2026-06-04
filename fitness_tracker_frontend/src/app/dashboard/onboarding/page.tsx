/**
 * @fileoverview Onboarding page for fitness level and preferences.
 */

'use client';

import React, {useState} from 'react';

import {apiRequest} from '@/lib/apiClient';
import {useMe} from '@/lib/auth';
import {FitnessLevel} from '@/lib/types';

function CheckboxPill(props: {label: string; checked: boolean; onToggle: () => void}): React.JSX.Element {
    return (
        <button
            type="button"
            className="btn"
            onClick={props.onToggle}
            style={{
                borderColor: props.checked ? 'rgba(59,130,246,0.5)' : 'var(--border)',
                background: props.checked ? 'rgba(59,130,246,0.12)' : 'white'
            }}
        >
            {props.label}
        </button>
    );
}

// PUBLIC_INTERFACE
export default function OnboardingPage(): React.JSX.Element {
    /** Collects onboarding inputs and saves to backend. */
    const {me} = useMe();
    const [level, setLevel] = useState<FitnessLevel>('beginner');
    const [daysPerWeek, setDaysPerWeek] = useState(3);
    const [equipment, setEquipment] = useState<string[]>([]);
    const [injuries, setInjuries] = useState('');

    const [isSaving, setSaving] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const equipmentOptions = ['None', 'Dumbbells', 'Barbell', 'Bands', 'Kettlebell', 'Machines'];

    async function onSave(): Promise<void> {
        setStatus(null);
        setSaving(true);
        try {
            const eq = equipment.includes('None') ? [] : equipment;
            await apiRequest('/onboarding', 'POST', {
                fitnessLevel: level,
                preferences: {
                    daysPerWeek,
                    equipment: eq,
                    injuries: injuries
                        .split(',')
                        .map((s) => s.trim())
                        .filter((s) => Boolean(s))
                }
            });
            await apiRequest('/plans/generate', 'POST', {});
            setStatus('Saved! Your plan has been generated/refreshed.');
        } catch (e) {
            setStatus('Failed to save. Ensure you are signed in and backend is running.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card">
            <div className="cardHeader">
                <h1 style={{margin: 0}}>Onboarding</h1>
                <p className="muted" style={{marginTop: 8}}>
                    Set your fitness level and preferences to personalize your workout plan.
                </p>
            </div>
            <div className="cardBody">
                {!me && (
                    <div className="card" style={{padding: 16, borderColor: 'rgba(245, 158, 11, 0.35)'}}>
                        <div style={{fontWeight: 700}}>Sign in required</div>
                        <div className="muted" style={{marginTop: 8}}>
                            Onboarding data is stored in your profile. Please sign in first.
                        </div>
                    </div>
                )}

                <div className="grid2" style={{marginTop: 12}}>
                    <div>
                        <div className="label">Fitness level</div>
                        <select className="input" value={level} onChange={(e) => setLevel(e.target.value as FitnessLevel)}>
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>

                    <div>
                        <div className="label">Days per week</div>
                        <input
                            className="input"
                            type="number"
                            min={1}
                            max={7}
                            value={daysPerWeek}
                            onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div style={{marginTop: 16}}>
                    <div className="label">Equipment</div>
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
                        {equipmentOptions.map((opt) => (
                            <CheckboxPill
                                key={opt}
                                label={opt}
                                checked={equipment.includes(opt)}
                                onToggle={() => {
                                    setEquipment((prev) => {
                                        if (prev.includes(opt)) {
                                            return prev.filter((x) => x !== opt);
                                        }
                                        return [...prev, opt];
                                    });
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div style={{marginTop: 16}}>
                    <div className="label">Injuries or constraints (comma-separated)</div>
                    <input
                        className="input"
                        value={injuries}
                        onChange={(e) => setInjuries(e.target.value)}
                        placeholder="e.g., knee pain, shoulder impingement"
                    />
                </div>

                <div style={{marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center'}}>
                    <button className="btn btnPrimary" disabled={!me || isSaving} onClick={onSave}>
                        {isSaving ? 'Saving…' : 'Save & generate plan'}
                    </button>
                    {status && <span className="muted">{status}</span>}
                </div>

                <div className="muted" style={{marginTop: 16, fontSize: 13, lineHeight: 1.6}}>
                    Backend expectations (MVP):
                    <code> POST /onboarding</code> stores profile preferences and
                    <code> POST /plans/generate</code> refreshes the current plan.
                </div>
            </div>
        </div>
    );
}
