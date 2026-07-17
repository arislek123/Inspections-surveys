/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Comment {
  id: string;
  author: string;
  date: string;
  content: string;
}

export interface Email {
  id: string;
  ref: string; // e.g. "1a", "1b"
  direction: 'Incoming' | 'Outgoing';
  sender: string;
  recipient: string;
  subject: string;
  date: string;
  summary: string;
  content: string;
  attachments?: string;
  followUpRequired: boolean;
  isImportant?: boolean;
}

export type CaseStatus =
  | 'In Worklist'
  | 'In Progress'
  | 'Awaiting Reply'
  | 'Finished'
  | 'Postponed'
  | 'Urgent'
  | 'Postponed but Reopened';

export type CasePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Case {
  id: string;
  vesselId: string;
  portId: string;
  jobType: string;
  subject: string;
  responsiblePerson: string;
  status: CaseStatus;
  priority: CasePriority;
  createdDate: string;
  lastUpdatedDate: string;
  deadline?: string;
  poNumber?: string;
  details: string;
  
  // Next Action Section
  nextAction: string;
  nextActionResponsible?: string;
  nextActionDueDate?: string;
  nextActionReminder?: string;

  // More Details
  agent?: string;
  vendor?: string;
  surveyor?: string;
  authority?: string; // Class / flag / authority involved
  eta?: string;
  etb?: string;
  ets?: string;
  attachments?: string;
  notes?: string;

  emails: Email[];
  comments: Comment[];
}

export interface Vessel {
  id: string;
  name: string;
  imo?: string;
  fleet?: string;
  archived?: boolean;
}

export interface Port {
  id: string;
  name: string;
  country: string;
  eta?: string;
  etb?: string;
  ets?: string;
  archived?: boolean;
}

export interface SavedFilter {
  id: string;
  name: string;
  vesselId?: string;
  portId?: string;
  jobType?: string;
  responsiblePerson?: string;
  status?: CaseStatus;
  priority?: CasePriority;
  finished?: boolean; // Finished or unfinished
  urgentOnly?: boolean;
}
