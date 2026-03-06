export const APPLICATION_STATUS = {
  APPLIED: 'Applied',
  REVIEWING: 'Reviewing',
  IN_CONTACT: 'In Contact',
  WAITING_RESPONSE: 'Waiting Response',
  NOT_SUITABLE: 'Not Suitable',
  CLOSED: 'Closed',
} as const;

export type ApplicationStatusType =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

export const APPLICATION_STATUS_VALUES = Object.values(APPLICATION_STATUS);