// ============================================================
// Training Domain — Unified Types (PR-01)
// ============================================================

/** A training module available for employee development */
export interface TrainingModule {
    id: string;
    title: string;
    description: string;
    /** Duration of the module in hours */
    durationHours: number;
    /** Skills this module aims to develop (camelCase canonical) */
    skillsTargeted: string[];
    /** External link to the training material */
    url?: string;
    /** Percentage of enrolled employees who completed, range 0–100 */
    completionRate?: number;
    /** Number of employees currently enrolled */
    enrolledCount?: number;
    /**
     * @deprecated Use `skillsTargeted` instead. Kept for transitional compatibility.
     */
    skills_targeted?: string[];
}
