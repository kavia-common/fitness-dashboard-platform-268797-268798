/**
 * @fileoverview Dashboard overview page.
 */

'use client';

import Link from 'next/link';
import React, {useEffect, useState} from 'react';

import {apiRequest} from '@/lib/apiClient';
import {useMe} from '@/lib/auth';
import {Goal, ProgressSummary, WorkoutPlan} from '@/lib/types';

function StatCard(props: {label: string; value: string; hint?: string}): React.JSX.Element {
    return (
        <div className="card" style={{padding: 16}}>
            <div className="muted" style={{fontSize: 13}}>
                {props.label}
            </div>
            <div style={{fontSize: 24, fontWeight: 800, marginTop: 8}}>{props.value}</div>
            {props.hint && (
                <div className="muted" style={{fontSize: 13, marginTop: 6}}>
                    {props.hint}
                </div>
            )}
        </div>
    );
}

// PUBLIC_INTERFACE
export default function DashboardOverviewPage(): React.JSX.Element {
    /** Overview dashboard with key stats and quick actions. */
    const {me, isLoading} = useMe();
    const [progress, setProgress] = useState<ProgressSummary | null>(null);
    const [goal, setGoal] = useState<Goal | null>(null);
    const [plan, setPlan] = useState<WorkoutPlan | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function load(): Promise<void> {
            if (!me) {
                return;
            }
            try {
                const [p, g, w] = await Promise.all([
                    apiRequest<ProgressSummary>('/progress/summary', 'GET'),
                    apiRequest<Goal | null>('/goals/active', 'GET'),
                    apiRequest<WorkoutPlan | null>('/plans/current', 'GET')
                ]);
                if (isCancelled) {
                    return;
                }
                setProgress(p);
                setGoal(g);
                setPlan(w);
            } catch (e) {
                // Backend might not yet be available; keep page functional with CTAs.
            }
        }

        void load();
        return () => {
            isCancelled = true;
        };
    }, [me]);

    return (
        <div>
            <div className="card" style={{marginBottom: 16}}>
                <div className="cardHeader">
                    <h1 style={{margin: 0}}>Overview</h1>
                    <p className="muted" style={{marginTop: 8}}>
                        Track your goals, follow your plan, and log workouts to build your streak.
                    </p>
                </div>
                <div className="cardBody">
                    {!me && !isLoading && (
                        <div className="card" style={{padding: 16, borderColor: 'rgba(59,130,246,0.3)'}}>
                            <div style={{fontWeight: 700}}>Sign in to personalize your dashboard</div>
                            <div className="muted" style={{marginTop: 8}}>
                                You can browse the UI, but API-backed data requires authentication.
                            </div>
                            <div style={{marginTop: 12}}>
                                <Link className="btn btnPrimary" href="/login">
                                    Login / Register
                                </Link>
                            </div>
                        </div>
                    )}

                    {me && (
                        <div className="grid3" style={{marginTop: 8}}>
                            <StatCard
                                label="Streak"
                                value={progress ? `${progress.streakDays} days` : '—'}
                                hint="Keep logging to grow your streak."
                            />
                            <StatCard
                                label="Workouts this week"
                                value={progress ? `${progress.workoutsThisWeek}` : '—'}
                                hint="Aim for consistency over intensity."
                            />
                            <StatCard
                                label="Minutes this week"
                                value={progress ? `${progress.minutesThisWeek}` : '—'}
                                hint="Small sessions still count."
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="grid2">
                <div className="card">
                    <div className="cardHeader">
                        <h2 style={{margin: 0}}>Goal</h2>
                        <p className="muted" style={{marginTop: 8}}>
                            Your active goal drives plan recommendations.
                        </p>
                    </div>
                    <div className="cardBody">
                        {!goal ? (
                            <>
                                <div className="muted">No active goal found.</div>
                                <div style={{marginTop: 12}}>
                                    <Link className="btn btnPrimary" href="/dashboard/goals">
                                        Set a goal
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <div>
                                <div style={{fontWeight: 700, fontSize: 18}}>{goal.type.replace('_', ' ')}</div>
                                <div className="muted" style={{marginTop: 8}}>
                                    Started: {new Date(goal.startDate).toLocaleDateString()}
                                </div>
                                <div style={{marginTop: 12}}>
                                    <Link className="btn" href="/dashboard/goals">
                                        View / edit
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="cardHeader">
                        <h2 style={{margin: 0}}>Workout plan</h2>
                        <p className="muted" style={{marginTop: 8}}>
                            Your personalized plan adapts to level and preferences.
                        </p>
                    </div>
                    <div className="cardBody">
                        {!plan ? (
                            <>
                                <div className="muted">No plan yet.</div>
                                <div style={{marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap'}}>
                                    <Link className="btn btnPrimary" href="/dashboard/onboarding">
                                        Complete onboarding
                                    </Link>
                                    <Link className="btn" href="/dashboard/plan">
                                        Generate / view plan
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{fontWeight: 700}}>{plan.summary}</div>
                                <div className="muted" style={{marginTop: 8}}>
                                    Updated: {new Date(plan.createdAt).toLocaleString()}
                                </div>
                                <div style={{marginTop: 12}}>
                                    <Link className="btn" href="/dashboard/plan">
                                        View plan
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
