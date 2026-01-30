import { Employee } from "@prisma/client";

export class EmployeePaginType {
    total_items: number;;
    data: Employee[];
    current_page: number;
    items_per_page: number;
}