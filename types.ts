
export type Parent = 'CARINE' | 'ROBERT' | 'NONE';

export interface DaySchedule {
  date: string; // ISO string YYYY-MM-DD
  parent: Parent;
  notes: string;
}

export interface MonthData {
  [key: string]: DaySchedule;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  user: string;
  dateModified: string;
  previousParent: Parent;
  newParent: Parent;
  previousNotes: string;
  newNotes: string;
}

export interface ParentConfig {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  email?: string;
}

export interface ParentEmails {
  CARINE: string;
  ROBERT: string;
}
