import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateCandidateReviewDto } from "./dto/create";
import { UpdateCandidateReviewDto } from "./dto/update";
import { UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@UseGuards(AuthGuard("jwt"))
@Injectable()
export class CandidateReviewService {
  constructor(private prisma: PrismaService) {}

  private canReview(role: string) {
    const r = role?.toLowerCase();
    return r === "Employer" || r === "Employee";
  }

  async create(candidateId: string, userId: string, role: string, dto: CreateCandidateReviewDto) {
    if (!this.canReview(role)) throw new ForbiddenException("Bạn không có quyền đánh giá.");

    // check candidate exists
    const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId }, select: { id: true } });
    if (!candidate) throw new NotFoundException("Candidate not found");
    
    return this.prisma.candidateReview.create({
      data: {
        candidate_id: candidateId,
        reviewer_id: userId,
        rating: dto.rating as any, // Prisma Decimal accepts string/Decimal; number thường vẫn ok, tuỳ version
        comment: dto.comment,
      },
    });
  }

  async listByCandidate(candidateId: string) {
    const items = await this.prisma.candidateReview.findMany({
      where: { candidate_id: candidateId, is_active: true },
      orderBy: { created_at: "desc" },
      include: {
        Reviewer: { select: { id: true, employee_name: true } }, // chỉnh field theo User của bạn
      },
    });

    const agg = await this.prisma.candidateReview.aggregate({
      where: { candidate_id: candidateId, is_active: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: agg._avg.rating ?? 0,
      count: agg._count.rating ?? 0,
      items,
    };
  }

  async update(reviewId: string, userId: string, role: string, dto: UpdateCandidateReviewDto) {
    if (!this.canReview(role)) throw new ForbiddenException("Bạn không có quyền sửa đánh giá.");

    const review = await this.prisma.candidateReview.findUnique({ where: { id: reviewId } });
    if (!review || !review.is_active) throw new NotFoundException("Review not found");

    if (review.reviewer_id !== userId) throw new ForbiddenException("Bạn chỉ được sửa đánh giá của chính mình.");

    return this.prisma.candidateReview.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating !== undefined ? (dto.rating as any) : undefined,
        comment: dto.comment,
      },
    });
  }

  async remove(reviewId: string, userId: string, role: string) {
    const review = await this.prisma.candidateReview.findUnique({ where: { id: reviewId } });
    if (!review || !review.is_active) throw new NotFoundException("Review not found");

    const r = role?.toLowerCase();
    const isOwner = review.reviewer_id === userId;
    const isAdmin = r === "Admin";

    if (!isOwner && !isAdmin) throw new ForbiddenException("Không có quyền xoá.");

    return this.prisma.candidateReview.update({
      where: { id: reviewId },
      data: { is_active: false },
    });
  }
}