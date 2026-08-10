// types.ts

export type HalfDayPeriod = 'AM' | 'PM';

export interface ScheduleItem {
  id: number;
  date: string; // ISO format: 'YYYY-MM-DD'
  address: string;
  assigneeId: number | null;
  secondaryAssigneeId: number | null;
  toolId: number | null;
  isHalfDay: boolean;          // New property
  halfDayPeriod: HalfDayPeriod; // New property ('AM' | 'PM')
}

export interface Assignee {
  id: number;
  name: string;
  phoneNumber: string;
}

export interface Tool {
  id: number;
  name: string;
  description?: string;
}
