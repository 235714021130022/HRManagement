export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  REVIEWING: 'Reviewing',
  CONTACTED: 'Contacted',
  INTERVIEWING: 'Interviewing',
  WAITING_RESPONSE: 'Waiting Response',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  // Legacy aliases for existing historical records.
  IN_CONTACT: 'In Contact',
  NOT_SUITABLE: 'Not Suitable',
  CLOSED: 'Closed',
} as const;

export type ApplicationStatusType =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const APPLICATION_STATUS_VALUES = Object.values(APPLICATION_STATUS);

export const JOB_STATUS = {
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
} as const;

export type JobStatusType =
  (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const JOB_STATUS_VALUES = Object.values(JOB_STATUS);

export const POSITION_POST_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

export type PositionPostStatusType =
  (typeof POSITION_POST_STATUS)[keyof typeof POSITION_POST_STATUS];

export const POSITION_POST_STATUS_VALUES = Object.values(POSITION_POST_STATUS);

export const RANK_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const;

export type RankStatusType =
  (typeof RANK_STATUS)[keyof typeof RANK_STATUS];

export const RANK_STATUS_VALUES = Object.values(RANK_STATUS);