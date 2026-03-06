import type { IEmployee } from "../../employee/types";
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

  position_applied_id?: string | null;
  referrer_id?: string | null;
  recruitment_infor_id?: string | null;

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
//   positionPost?: ISettingPositionPosts | null;
//   potential?: ISettingPotentialType | null;

  candidateExperiences?: ICandidateExperience[];
//   schedules?: ISchedulesCandidates[];
//   jobCandidates?: IJobCandidates[];
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