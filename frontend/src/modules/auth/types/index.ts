import type { IEmployee } from "../../employee/types";

export interface LoginRespone {
  accessToken?: string;
  refreshToken?: string;
  user?: IEmployee;
  require_change_password?: boolean;
  user_id?: string;
  message?: string;
}