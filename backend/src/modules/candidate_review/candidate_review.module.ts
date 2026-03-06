import { Module } from '@nestjs/common';
import { CandidateReviewController } from './candidate_review.controller';
import { CandidateReviewService } from './candidate_review.service';
import { JwtModule } from "@nestjs/jwt";
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || "secret", // phải giống secret bạn sign token
    }),
  ],
  controllers: [CandidateReviewController],
  providers: [CandidateReviewService]
})
export class CandidateReviewModule {}
