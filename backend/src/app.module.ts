import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { InforcompanyModule } from './modules/inforcompany/inforcompany.module';
import { RoleModule } from './modules/role/role.module';
import { RecinformModule } from './modules/recinform/recinform.module';
import { PositionPostModule } from './modules/setting/position_post/position_post.module';
import { RankModule } from './modules/setting/rank/rank.module';
import { TrainlevModule } from './modules/setting/trainlev/trainlev.module';
import { PotcanModule } from './modules/setting/potcan/potcan.module';
import { SendEmailModule } from './modules/setting/send_email/send_email.module';
import { CandidateModule } from './modules/candidate/candidate.module';
import { TypeScheModule } from './modules/type_sche/type_sche.module';
import { TypescheLinkModule } from './modules/typesche_link/typesche_link.module';
import { InterviewScheModule } from './modules/interview_sche/interview_sche.module';
import { JobModule } from './modules/job/job.module';
import { SkillModule } from './modules/skill/skill.module';
import { CompanyRegisterModule } from './modules/company_register/company_register.module';
import { CandidateReviewModule } from './modules/candidate_review/candidate_review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    AuthModule,
    PrismaModule,
    EmployeeModule,
    InforcompanyModule,
    RoleModule,
    RecinformModule,
    PositionPostModule,
    RankModule,
    TrainlevModule,
    PotcanModule,
    SendEmailModule,
    CandidateModule,
    TypeScheModule,
    TypescheLinkModule,
    InterviewScheModule,
    JobModule,
    SkillModule,
    CompanyRegisterModule,
    CandidateReviewModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
