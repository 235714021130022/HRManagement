import { Skill } from '@prisma/client';

export type SkillPaginType = {
  data: Skill[];
  current_pages: number;
  items_per_pages: number;
  total_items: number;
};