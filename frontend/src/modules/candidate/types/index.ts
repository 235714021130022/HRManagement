import type { IEmployee } from "../../employee/types";
import type { IJobCandidates } from "../../job/types";
import type { IRecruitmentInfor } from "../../recruit_inf/types";

export interface ICandidate {
  id: string;

  candidate_code?: string | null;
  candidate_name: string;
  date_of_birth?: Date | null;
  gender?: string | null;
  phone_number?: string | null;
  email?: string | null;
  address?: string | null;
  country?: string | null;
  provice?: string | null;
  district?: string | null;
  date_applied?: Date | null;

  referrer_id?: string | null;

  is_active: boolean;
  is_potential: boolean;

  potential_type_id?: string | null;

  created_at?: Date | null;
  updated_at?: Date | null;

  cv_file?: string;

  cv_uploaded_at?: Date | null;

  // ===== Relations =====
  recruitment_infor?: IRecruitmentInfor | null;
  referrer?: IEmployee | null;
  status: string
//   potential?: ISettingPotentialType | null;

  candidateExperiences?: ICandidateExperience[];
  statusApplication?: IApplycation[];
//   schedules?: ISchedulesCandidates[];
  jobCandidates?: IJobCandidates[];
//   candidateSkill?: ICandidateSkill[];
}

export interface ICandidateExperience {
  id?: string
  candidate_id?: string

  company_name?: string
  position?: string

  from_month?: string
  to_month?: string

  job_description?: string

  is_active?: boolean
}

export interface IApplycation {
  id: string;

  candidate_id: string;
  recruitment_infor_id: string;
  
  status: string;
  note?: string | null;
  recruitment_infor?: Pick<IRecruitmentInfor, 'id' | 'post_title' | 'internal_title'> | null;
}

export interface ICandidateReview {
  id: string;
  candidate_id: string;
  reviewer_id: string;
  rating: number | string;
  comment?: string | null;
  is_active?: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
  Reviewer?: {
    id: string;
    employee_name?: string | null;
  } | null;
}

export interface ICandidateAuditLog {
  id: string;
  candidate_id: string;
  actor_employee_id?: string | null;
  actor_type?: string | null;
  actor_role?: string | null;
  action: string;
  message: string;
  metadata?: Record<string, any> | null;
  created_at: string | Date;
  actorEmployee?: {
    id: string;
    employee_name?: string | null;
  } | null;
}