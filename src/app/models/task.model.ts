export interface Task {
    id: number,
    ref: string,
    fk_project: number,
    date_create: string,
    due_date?: string | null;
    due_date_format?: string | null;
    due_date_short_format?: string | null;
    title: string,
    description: string;
    short_desc: string;
    planned_workload: number,
    progress?: number | null;
    rang: number,
    severity?: string | null;
    color?: string | null;
    shared?: number | null;
    status: number
}