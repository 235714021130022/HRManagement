export class CreateCompanyRegistrationDto {
  companyName: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  createdById: string; // nhân viên tạo hồ sơ
  is_active: boolean
}