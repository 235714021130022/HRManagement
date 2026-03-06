import type { DetailField, DetailSection } from "../types";

export const INFOR_COMPANY_DETAIL_SECTIONS: Record<string, DetailSection> = {
  company: {
    title: "Company",
    fields: [
      { key: "infor_code", label: "Company Code", note: "Mã Internal công ty" },
      { key: "full_name", label: "Company Name", note: "Tên đầy đủ công ty" },
      { key: "acronym_name", label: "Short Name", note: "Tên viết tắt / tên giao dịch" },
      { key: "image_logo", label: "Company Logo", note: "Logo công ty", type: "image" },
      { key: "is_active", label: "Active", note: "Trạng thái hoạt động", type: "boolean" },
    ] satisfies DetailField[], // ✅ quan trọng
  },
  businessRegistration: {
    title: "Business Registration",
    fields: [
      { key: "code_business", label: "Business License No.", note: "Số GPKD" },
      { key: "date_of_issue", label: "Issue Date", note: "Ngày cấp" },
      { key: "place_of_issue", label: "Issued By", note: "Nơi cấp" },
    ] satisfies DetailField[],
  },
  contact: {
    title: "Contact",
    fields: [
      { key: "address", label: "Address", note: "Địa chỉ" },
      { key: "email", label: "Email", note: "Email" },
      { key: "website", label: "Website", note: "Website" },
    ] satisfies DetailField[],
  },
};

export const formatDate = (value?: string | Date | null) => {
    if(!value){
        return '/';
    }
    const date = new Date(value);
    if(isNaN(date.getTime())) return '/';

    return date.toLocaleDateString('vi-VN');
}