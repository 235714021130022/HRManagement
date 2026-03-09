// =========================
// SCHEDULE TYPE

import type { ICandidate } from "../../candidate/types";
import type { IRecruitmentInfor } from "../../recruit_inf/types";

// =========================

export interface IApplication {
  id: string;

  candidate_id: string;
  recruitment_infor_id: string;
  
  status: string;
  note?: string | null;
  recruitment_infor?: Pick<IRecruitmentInfor, 'id' | 'post_title' | 'internal_title' | 'workLocation'> | null;
  candidate?: Pick<ICandidate, 'id' | 'candidate_name'> | null;
}


export interface ISchedulesType {
  id: string;
  st_code?: string | null;
  type_name?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
}

export interface ISchedulesTypeDetail extends ISchedulesType {
  interviewSchedules?: IInterviewSchedule[];
  typeSchedules_Links?: ITypeSchedulesLink[];
}

// =========================
// TYPE SCHEDULE LINK
// =========================
export interface ITypeSchedulesLink {
  id: string;
  tl_code?: string | null;
  type_schedule_id: string;
  exam_link?: string | null;
  is_active: boolean;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
}

export interface ITypeSchedulesLinkDetail extends ITypeSchedulesLink {
  scheduleType?: ISchedulesType;
}

// =========================
// INTERVIEW SCHEDULE
// =========================
export interface IInterviewSchedule {
  id: string;
  sche_code?: string | null;
  interview_date?: string | Date | null;
  interview_location?: string | null;
  interview_room?: string | null;
  meeting_link?: string | null;
  time_duration: number;
  times?: string | Date | null;
  type_schedule_id?: string | null;
  evaluation_id?: string | null;
  is_active: boolean;
  created_at?: string | Date | null;
  updated_at?: string | Date | null;
}

export interface IInterviewScheduleDetail extends IInterviewSchedule {
  scheduleType?: ISchedulesType | null;
  candidates?: ISchedulesCandidates[];
}

// =========================
// SCHEDULES CANDIDATES
// =========================
export interface ISchedulesCandidates {
  id: string;
  interview_schedule_id: string;
  candidate_id: string;
}

export interface ISchedulesCandidatesDetail extends ISchedulesCandidates {
  interviewSchedule?: IInterviewSchedule;
  candidate?: ICandidate;
}