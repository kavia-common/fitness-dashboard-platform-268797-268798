/**
 * @fileoverview Shared type definitions used across UI components.
 */

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type GoalType = 'weight_loss' | 'strength' | 'endurance' | 'general_health';

export type UserProfile = {
    id: string;
    email: string;
    displayName: string;
    role: 'user' | 'admin';
    fitnessLevel?: FitnessLevel;
    preferences?: {
        daysPerWeek?: number;
        equipment?: string[];
        injuries?: string[];
    };
};

export type Goal = {
    id: string;
    type: GoalType;
    targetValue?: number;
    targetUnit?: string;
    startDate: string;
    endDate?: string;
};

export type WorkoutPlanDay = {
    dayLabel: string;
    focus: string;
    exercises: Array<{
        name: string;
        sets?: number;
        reps?: string;
        durationMin?: number;
        notes?: string;
    }>;
};

export type WorkoutPlan = {
    id: string;
    createdAt: string;
    summary: string;
    days: WorkoutPlanDay[];
};

export type WorkoutLog = {
    id: string;
    date: string;
    workoutName: string;
    durationMin?: number;
    notes?: string;
};

export type NutritionLog = {
    id: string;
    date: string;
    calories?: number;
    proteinG?: number;
    notes?: string;
};

export type ProgressSummary = {
    streakDays: number;
    workoutsThisWeek: number;
    minutesThisWeek: number;
    lastWorkoutDate?: string;
};
