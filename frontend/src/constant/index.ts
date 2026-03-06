// =========================
// Employee Status
// =========================
export const EmployeeStatus = {
  Active: "Active",
  Inactive: "Inactive",
} as const;

export type EmployeeStatusKey = keyof typeof EmployeeStatus;
export type EmployeeStatusType = (typeof EmployeeStatus)[EmployeeStatusKey];

export const EMPLOYEE_STATUS_DISPLAY: Record<EmployeeStatusType, string> = {
  [EmployeeStatus.Active]: "Active",
  [EmployeeStatus.Inactive]: "Inactive",
};

// =========================
// Gender
// =========================
export const GenderEmployee = {
  Male: "Male",
  Female: "Female",
} as const;

export type GenderEmployeeKey = keyof typeof GenderEmployee;
export type GenderEmployeeType = (typeof GenderEmployee)[GenderEmployeeKey];

export const GENDER_EMPLOYEE_DISPLAY: Record<GenderEmployeeType, string> = {
  [GenderEmployee.Male]: "Male",
  [GenderEmployee.Female]: "Female",
};

// =========================
// Company Registration Request Status
// =========================
export const CompanyRegistrationStatus = {
  Pending: "pending",
  Approved: "approved",
  Rejected: "rejected",
} as const;

export type CompanyRegistrationStatusKey = keyof typeof CompanyRegistrationStatus;
export type CompanyRegistrationStatusType =
  (typeof CompanyRegistrationStatus)[CompanyRegistrationStatusKey];

export const COMPANY_REGISTRATION_STATUS_DISPLAY: Record<
  CompanyRegistrationStatusType,
  string
> = {
  [CompanyRegistrationStatus.Pending]: "Pending",
  [CompanyRegistrationStatus.Approved]: "Approved",
  [CompanyRegistrationStatus.Rejected]: "Rejected",
};

// =========================
// InforCompany Status
// =========================
export const InforCompanyStatus = {
  Active: "Active",
  Inactive: "Inactive",
} as const;

export type InforCompanyStatusKey = keyof typeof InforCompanyStatus;
export type InforCompanyStatusType = (typeof InforCompanyStatus)[InforCompanyStatusKey];

export const INFOR_COMPANY_STATUS_DISPLAY: Record<InforCompanyStatusType, string> =
  {
    [InforCompanyStatus.Active]: "Active",
    [InforCompanyStatus.Inactive]: "Inactive",
  };

// =========================
// Recruitment Status
// =========================
export const RecruitmentStatus = {
  Public: "PUBLIC",
  Internal: "INTERNAL",
  Closed: "CLOSED",
  StopReceiving: "STOP_RECEIVING",
  Draft: "DRAFT",
} as const;

export type RecruitmentStatusKey = keyof typeof RecruitmentStatus;
export type RecruitmentStatusType =
  (typeof RecruitmentStatus)[RecruitmentStatusKey];

export const RECRUITMENT_STATUS_DISPLAY: Record<
  RecruitmentStatusType,
  string
> = {
  [RecruitmentStatus.Public]: "Public",
  [RecruitmentStatus.Internal]: "Internal",
  [RecruitmentStatus.Closed]: "Closed",
  [RecruitmentStatus.StopReceiving]: "Stop Receiving",
  [RecruitmentStatus.Draft]: "Draft",
};

export const CandidateStatus = {
  Active: "Active",
  Inactive: "Inactive",
} as const;

export type CandidateStatusKey = keyof typeof CandidateStatus;
export type CandidateStatusType = (typeof CandidateStatus)[CandidateStatusKey];

export const CANDIDATE_STATUS_DISPLAY: Record<CandidateStatusType, string> = {
  [CandidateStatus.Active]: "Active",
  [CandidateStatus.Inactive]: "Inactive",
};
