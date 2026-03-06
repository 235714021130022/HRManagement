import { InforCompany } from "@prisma/client";
export class InformCompanyPaginType {
    total_items: number;
    data: InforCompany[];
    current_page: number;
    item_per_page: number;
}