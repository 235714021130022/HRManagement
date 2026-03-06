import { TypeSchedules_Link } from '@prisma/client';

export interface TypeSchedulesLinkPaginType {
  data: TypeSchedules_Link[];
  current_pages: number;
  items_per_pages: number;
  total_items: number;
}