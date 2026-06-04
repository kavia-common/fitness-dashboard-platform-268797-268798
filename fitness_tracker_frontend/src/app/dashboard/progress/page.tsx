/**
 * @fileoverview Progress dashboard page with charts.
 */

'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

import {apiRequest} from '@/lib/apiClient';
import {useMe} from '@/lib/auth';

type WeeklyProgressPoint = {
    weekLabel: string;
    workouts: number;
    minutes: number;
};

type ProgressDashboard = {
    weekly: WeeklyProgressPoint[];
    personalRecords: Array<{label: string; value: string}>;
};

// PUBLIC_INTERFACE
export default function ProgressPage(): React.JSX.Element {
    /** Shows progress charts, PRs, and streak metrics. */
    const {me} = useMe();
    const [data, setData] = useState<ProgressDashboard | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function load(): Promise<void> {
            if (!me) {
                return;
            }
            try {
                const res = await apiRequest<ProgressDashboard>('/progress/dashboard', 'GET');
                if (isCancelled) {
                    return;
                }
                setData(res);
            } catch (e) {
                // ignore
            }
        }

        void load();
        return () => {
            isCancelled = true;
        };
    }, [me]);

    const fallback = useMemo<ProgressDashboard>(() => {
        return {
            weekly: [
                {weekLabel: 'W-3', workouts: 2, minutes: 80},
                {weekLabel: 'W-2', workouts: 3, minutes: 115},
                {weekLabel: 'W-1', workouts: 3, minutes: 140},
                {weekLabel: 'W0', workouts: 2, minutes: 90}
            ],
            personalRecords: [
                {label: 'Longest streak', value: '—'},
                {label: 'Best week (minutes)', value: '—'},
                {label: 'Most workouts in a week', value: '—'}
            ]
        };
    }, []);

    const view = data || fallback;

    return (
        <div className="card">
            <div className="cardHeader">
                <h1 style={{margin: 0}}>Progress</h1>
                <p className="muted" style={{marginTop: 8}}>
                    Weekly consistency + personal records (MVP).
                </p>
            </div>
            <div className="cardBody">
                {!me && (
                    <div className="card" style={{padding: 16, borderColor: 'rgba(245, 158, 11, 0.35)'}}>
                        <div style={{fontWeight: 700}}>Sign in required</div>
                        <div className="muted" style={{marginTop: 8}}>
                            Progress is derived from your logs. Please sign in first.
                        </div>
                    </div>
                )}

                <div className="grid2" style={{marginTop: 12}}>
                    <div className="card" style={{padding: 16}}>
                        <div style={{fontWeight: 700}}>Workouts per week</div>
                        <div style={{height: 260, marginTop: 12}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={view.weekly}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="weekLabel" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="workouts" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="muted" style={{marginTop: 10, fontSize: 13}}>
                            Based on workout logs.
                        </div>
                    </div>

                    <div className="card" style={{padding: 16}}>
                        <div style={{fontWeight: 700}}>Minutes per week</div>
                        <div style={{height: 260, marginTop: 12}}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={view.weekly}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="weekLabel" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="minutes" fill="var(--secondary)" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="muted" style={{marginTop: 10, fontSize: 13}}>
                            Minutes logged in workouts.
                        </div>
                    </div>
                </div>

                <div className="card" style={{padding: 16, marginTop: 16}}>
                    <div style={{fontWeight: 700}}>Personal records</div>
                    <div className="grid3" style={{marginTop: 12}}>
                        {view.personalRecords.map((pr) => (
                            <div key={pr.label} className="card" style={{padding: 12}}>
                                <div className="muted" style={{fontSize: 13}}>
                                    {pr.label}
                                </div>
                                <div style={{fontWeight: 800, marginTop: 8}}>{pr.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="muted" style={{marginTop: 16, fontSize: 13, lineHeight: 1.6}}>
                    Backend expectation:
                    <code> GET /progress/dashboard</code> (or UI uses fallback sample data if unavailable).
                </div>
            </div>
        </div>
    );
}
