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