import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CandidateReviewService } from "./candidate_review.service";
import { CreateCandidateReviewDto } from "./dto/create";
import { UpdateCandidateReviewDto } from "./dto/update";

@Controller()
export class CandidateReviewController {
  constructor(
    private service: CandidateReviewService,
    private jwtService: JwtService,
  ) {}

  private async getAuth(req: any) {
    const auth = req.headers?.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) throw new UnauthorizedException("Missing Bearer token");

    const payload: any = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
        });

    const userId = payload.id;     // tuỳ payload bạn sign
    const role = payload.roles?.[0];

    if (!userId) throw new UnauthorizedException("Token missing user id");
    console.log("payload:", payload);
        console.log("role:", role);
    return { userId, role };
  }

  @Get("candidate/:id/reviews")
  list(@Param("id") candidateId: string) {
    return this.service.listByCandidate(candidateId);
  }
  
  @Post("candidate/:id/reviews")
  async create(@Param("id") candidateId: string, @Req() req: any, @Body() dto: CreateCandidateReviewDto) {
    const { userId, role } = await this.getAuth(req);
    
    return this.service.create(candidateId, userId, role, dto);
  }

  @Patch("reviews/:reviewId")
  async update(@Param("reviewId") reviewId: string, @Req() req: any, @Body() dto: UpdateCandidateReviewDto) {
    const { userId, role } = await this.getAuth(req);
    return this.service.update(reviewId, userId, role, dto);
  }

  @Delete("reviews/:reviewId")
  async remove(@Param("reviewId") reviewId: string, @Req() req: any) {
    const { userId, role } = await this.getAuth(req);
    return this.service.remove(reviewId, userId, role);
  }
}