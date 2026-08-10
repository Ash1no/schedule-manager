export interface ScheduleItem {
  id: number;
  date: string; // Format: "YYYY-MM-DD"
  address: string;
  assigneeId: number | null;
  secondaryAssigneeId?: number | null; // Optional 2nd assignee ID
  toolId: number | null;
}

export interface Assignee {
  id: number;
  name: string;
  phoneNumber: string;
}

export interface Tool {
  id: number;
  name: string;
  description: string;
}
