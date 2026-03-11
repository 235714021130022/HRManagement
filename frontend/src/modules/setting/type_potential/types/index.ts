import type { TypePotentialStatusType } from "../../../../constant";

export interface ITypePotential {
  id: string;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface TypePotentialFormValues {
  name: string;
  description: string;
  status: TypePotentialStatusType;
}
