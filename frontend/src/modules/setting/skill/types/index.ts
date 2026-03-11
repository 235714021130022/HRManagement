import type { SkillStatusType } from "../../../../constant";

export interface ISkill {
  id: string;
  name: string;
  parent_id?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
  children?: ISkill[];
}

export interface SkillFormValues {
  name: string;
  parent_id: string;
  status: SkillStatusType;
}
