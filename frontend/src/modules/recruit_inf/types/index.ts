import type { RecruitmentStatusType } from "../../../constant";
import type { IInforCompany } from "../../inform_company/types";

export interface IRecruitmentInfor {
  id: string;

  recruitment_code?: string | null;
  internal_title?: string | null;
  post_title?: string | null;

  department_id?: string | null;
  work_location_id?: string | null;
  rank_id?: string | null;
  contact_person_id?: string | null;

  type_of_job?: string | null;
  application_deadline?: string | null; // ISO string
  salary_from?: number | null;
  salary_to?: number | null;
  salary_currency?: string | null;

  status: RecruitmentStatusType ;
  is_active: boolean;

  created_at?: string | null; // ISO string
  updated_at?: string | null; // ISO string

  // relations (optional)
  department?: any | null;
  workLocation?: IInforCompany | null;
  rank?: any | null;
  contactPerson?: any | null;

  recruitmentPlans?: any[];
  recruitmentCosts?: any[];
  candidateRecruitments?: any[];

  total_cost?: number | null;
  cost_currency?: string | null;

  department_name?: string | null;
    work_location_name?: string | null;
}

export type FormRecruitmentInforValues = {
  recruitment_code: string;
  internal_title: string;
  post_title: string;

  department_id: string;       // select -> id
  work_location_id: string;    // select -> id
  rank_id: string;             // select -> id
  contact_person_id: string;   // select -> id

  type_of_job: string;
  application_deadline: string; // "YYYY-MM-DD" (or "")

  salary_from: string; // để string để input number dễ, submit convert number
  salary_to: string;
  salary_currency: string;

  status: RecruitmentStatusType;
  is_active: boolean;
  updated_at: string;
  created_at: string;
  // don vi
  total_cost: number;
  cost_currency: string

}

export interface IRecruitmentPlanParent {
  id: string;
  recruitment_id?: string | null;

  total_real_number?: number | null;
  monthly_target?: string | null;      // ISO string
  expected_deadline?: string | null;   // ISO string

  recruitmentInfor?: any | null;

  recruitmentPlanChildBatches?: IRecruitmentPlanChildBatch[];
  recruitmentPlanChildPosteds?: IRecruitmentPlanChildPosted[];
}

export interface IRecruitmentPlanChildBatch {
  id: string;
  recruitment_plan_parent_id?: string | null;

  batches_title?: string | null;
  from_date?: string | null;           // ISO string
  to_date?: string | null;             // ISO string
  number_recruitment?: number | null;
  monthly_target?: string | null;      // ISO string

  recruitmentPlanParent?: any | null;
}

export interface IRecruitmentPlanChildPosted {
  id: string;
  recruitment_plan_parent_id?: string | null;

  posted_date?: string | null;         // ISO string
  expiration_date?: string | null;     // ISO string
  job_board?: string | null;

  recruitmentPlanParent?: any | null;
}

export interface IRecruitmentCosts {
  id: string;
  recruitment_id?: string | null;

  cost_type?: string | null;
  amount?: number | null;
  currency?: string | null;

  recruitmentInfor?: any | null;
}

export type FormRecruitmentPlanParentValues = {
  recruitment_id: string;
  total_real_number: string;     // input number -> convert
  monthly_target: string;        // YYYY-MM-DD
  expected_deadline: string;     // YYYY-MM-DD
}

export type FormRecruitmentPlanChildBatchValues = {
  recruitment_plan_parent_id: string;

  batches_title: string;
  from_date: string;            // YYYY-MM-DD
  to_date: string;              // YYYY-MM-DD
  number_recruitment: string;   // number input
  monthly_target: string;       // YYYY-MM-DD
}

export type FormRecruitmentPlanChildPostedValues  = {
  recruitment_plan_parent_id: string;

  posted_date: string;          // YYYY-MM-DD
  expiration_date: string;      // YYYY-MM-DD
  job_board: string;
}

export type FormRecruitmentCostsValues = {
  recruitment_id: string;
  cost_type: string;
  amount: string;     
  currency: string;
}