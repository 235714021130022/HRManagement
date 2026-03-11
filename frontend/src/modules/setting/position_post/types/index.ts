import type { PositionPostStatusType } from "../../../../constant";

export interface IPositionPost {
  id: string;
  position_code?: string | null;
  name_post?: string | null;
  unit_id?: string | null;
  description_post?: string | null;
  requirements_post?: string | null;
  benefits_post?: string | null;
  Setting_Process_Recruitment_id?: string | null;
  is_active: boolean;
  auto_rotation: boolean;
  auto_eli_candidate: boolean;
  auto_near: boolean;
  status?: PositionPostStatusType | string | null;
  created_at?: string | null;
  updated_at?: string | null;
  inforCompany?: {
    id: string;
    full_name?: string | null;
    acronym_name?: string | null;
  } | null;
}

export interface PositionPostFormValues {
  name_post: string;
  unit_id: string;
  description_post: string;
  requirements_post: string;
  benefits_post: string;
  auto_rotation: boolean;
  auto_eli_candidate: boolean;
  auto_near: boolean;
  status: PositionPostStatusType;
  is_active: boolean;
}
