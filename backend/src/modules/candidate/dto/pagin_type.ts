import { Candidate } from '@prisma/client';

export class CandidatePaginType {
  data: Candidate[];
  current_pages: number;
  items_per_pages: number;
  total_items: number;
}