import { Schedules_Type } from "@prisma/client";

export class SchedulesTypePaginType {
  data: Schedules_Type[];
  current_pages: number;
  items_per_pages: number;
  total_items: number;
}