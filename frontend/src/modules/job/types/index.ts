import type { IEmployee } from "../../employee/types";

export interface IJob {
	id: string;
	job_code?: string | null;
	name_job?: string | null;
	description_job?: string | null;
	type_job?: string | null;
	result_job?: string | null;
	employee_id?: string | null;
	deadline?: string | Date | null;
	remind_enabled?: boolean | null;
	remind_before_minutes?: number | null;
	status?: string | null;
	is_active?: boolean;
	created_at?: string | Date | null;
	updated_at?: string | Date | null;

	employee?: Pick<IEmployee, "id" | "employee_name"> | null;
	jobCandidates?: IJobCandidates[];
}

export interface IJobCandidates {
	id: string;
	job_id: string;
	candidate_id: string;
	job?: IJob | null;
}

export type IJobCandidate = IJobCandidates;
