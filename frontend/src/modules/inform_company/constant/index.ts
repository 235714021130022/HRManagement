export const BUSSINESS_TYPE = {
  LLC_ONE_MEMBER: 'LLC_ONE_MEMBER',
  LLC_MULTI_MEMBER: 'LLC_MULTI_MEMBER',
  JOINT_STOCK: 'JOINT_STOCK',
  PRIVATE: 'PRIVATE',
  PARTNERSHIP: 'PARTNERSHIP',
  HOUSEHOLD: 'HOUSEHOLD',
  STATE: 'STATE',
  FDI: 'FDI',
} as const;

export const BUSINESS_TYPE_OPTIONS = [
  { value: BUSSINESS_TYPE.LLC_ONE_MEMBER, label: 'Công ty TNHH 1 thành viên' },
  { value: BUSSINESS_TYPE.LLC_MULTI_MEMBER, label: 'Công ty TNHH 2 thành viên trở lên' },
  { value: BUSSINESS_TYPE.JOINT_STOCK, label: 'Công ty Cổ phần' },
  { value: BUSSINESS_TYPE.PRIVATE, label: 'Doanh nghiệp tư nhân' },
  { value: BUSSINESS_TYPE.PARTNERSHIP, label: 'Công ty hợp danh' },
  { value: BUSSINESS_TYPE.HOUSEHOLD, label: 'Hộ kinh doanh' },
  { value: BUSSINESS_TYPE.STATE, label: 'Doanh nghiệp nhà nước' },
  { value: BUSSINESS_TYPE.FDI, label: 'Doanh nghiệp có vốn đầu tư nước ngoài' },
];