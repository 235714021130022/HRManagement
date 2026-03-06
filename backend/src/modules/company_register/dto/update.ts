export class UpdateCompanyRegistrationDto {
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  status?: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  is_active: boolean
}