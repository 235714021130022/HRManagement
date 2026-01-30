/*
  Warnings:

  - Made the column `email_account` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_account` on table `Employee` required. This step will fail if there are existing NULL values in that column.
  - Made the column `parent_id` on table `InforCompany` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "employee_name" SET DATA TYPE VARCHAR(300),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "job_title" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "phone_unit" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "email_unit" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email_account" SET NOT NULL,
ALTER COLUMN "email_account" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "phone_account" SET NOT NULL,
ALTER COLUMN "phone_account" SET DATA TYPE VARCHAR(15);

-- AlterTable
ALTER TABLE "InforCompany" ADD COLUMN     "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "full_name" DROP NOT NULL,
ALTER COLUMN "full_name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "acronym_name" DROP NOT NULL,
ALTER COLUMN "acronym_name" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "business_type" DROP NOT NULL,
ALTER COLUMN "business_type" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "tax_idennumber" DROP NOT NULL,
ALTER COLUMN "tax_idennumber" SET DATA TYPE VARCHAR(13),
ALTER COLUMN "code_company" DROP NOT NULL,
ALTER COLUMN "code_company" SET DATA TYPE VARCHAR(10),
ALTER COLUMN "date_stablish" DROP NOT NULL,
ALTER COLUMN "image_logo" DROP NOT NULL,
ALTER COLUMN "code_business" DROP NOT NULL,
ALTER COLUMN "code_business" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "date_of_issue" DROP NOT NULL,
ALTER COLUMN "place_of_issue" DROP NOT NULL,
ALTER COLUMN "unit_title" DROP NOT NULL,
ALTER COLUMN "unit_title" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "phone_number" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "fax" DROP NOT NULL,
ALTER COLUMN "fax" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "website" DROP NOT NULL,
ALTER COLUMN "website" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "parent_id" SET NOT NULL,
ALTER COLUMN "organization_level" DROP NOT NULL,
ALTER COLUMN "organization_level" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "field_of_activity" DROP NOT NULL,
ALTER COLUMN "field_of_activity" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "name_role" DROP NOT NULL,
ALTER COLUMN "name_role" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "updated_at" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PositionCompany" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "position_code" VARCHAR(50),
    "name_position" VARCHAR(100),
    "description" TEXT,
    "org_unit_id" UUID,
    "status" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "group_position" UUID,
    "job_title_id" UUID,

    CONSTRAINT "PositionCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTitle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_title" VARCHAR(100),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobTitle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupPosition" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_group" VARCHAR(100),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationLevel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_level" VARCHAR(100),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment_Infor" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recruitment_code" VARCHAR(50),
    "internal_title" VARCHAR(300),
    "post_title" VARCHAR(300),
    "department_id" UUID NOT NULL,
    "rank_id" UUID NOT NULL,
    "work_location_id" UUID NOT NULL,
    "type_of_job" VARCHAR(150),
    "application_deadline" DATE,
    "salary_from" DOUBLE PRECISION,
    "salary_to" DOUBLE PRECISION,
    "salary_currency" VARCHAR(50),
    "contact_person_id" UUID NOT NULL,

    CONSTRAINT "Recruitment_Infor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment_Plan_Parent" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recruitment_id" UUID,
    "total_real_number" INTEGER,
    "monthly_target" DATE,
    "expected_deadline" DATE,

    CONSTRAINT "Recruitment_Plan_Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment_Plan_Child_Batches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recruitment_plan_parent_id" UUID,
    "batches_title" VARCHAR(200),
    "from_date" DATE,
    "to_date" DATE,
    "number_recruitment" INTEGER,
    "monthly_target" DATE,

    CONSTRAINT "Recruitment_Plan_Child_Batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment_Plan_Child_Posted" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recruitment_plan_parent_id" UUID,
    "posted_date" DATE,
    "expiration_date" DATE,
    "job_board" VARCHAR(100),

    CONSTRAINT "Recruitment_Plan_Child_Posted_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruitment_Costs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recruitment_id" UUID,
    "cost_type" VARCHAR(300),
    "amount" DOUBLE PRECISION,
    "currency" VARCHAR(50),

    CONSTRAINT "Recruitment_Costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Position_Posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "position_code" VARCHAR(50),
    "name_post" VARCHAR(100),
    "unit_id" UUID,
    "description_post" TEXT,
    "requirements_post" TEXT,
    "benefits_post" TEXT,
    "Setting_Process_Recruitment_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "auto_rotation" BOOLEAN NOT NULL DEFAULT false,
    "auto_eli_candidate" BOOLEAN NOT NULL DEFAULT false,
    "auto_near" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Setting_Position_Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Process_Recruitment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_process" VARCHAR(100),
    "order_index" INTEGER NOT NULL,
    "hex_color" VARCHAR(7),
    "is_started" BOOLEAN NOT NULL DEFAULT false,
    "is_ended" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Process_Recruitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Channel_Recruitment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "channel_code" VARCHAR(50),
    "name_channel" VARCHAR(100),
    "address_channel" TEXT,
    "unit_id" UUID,
    "status" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Channel_Recruitment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rank" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rank_code" VARCHAR(50),
    "name_rank" VARCHAR(100),
    "unit_id" UUID,
    "status" VARCHAR(50),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Training_Level" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "level_code" VARCHAR(50),
    "name_level" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Training_Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Training_Place" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "place_code" VARCHAR(50),
    "name_place" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Training_Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Specialization" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "specialization_code" VARCHAR(50),
    "name_specialization" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate_Card" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_card_name" VARCHAR(300),
    "color_card" VARCHAR(7),
    "unit_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Potential_Candidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_name" VARCHAR(300),
    "color_potential" VARCHAR(7),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Potential_Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupReason_DisCandidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_reason_code" VARCHAR(50),
    "name_group_reason" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupReason_DisCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reason_DisCandidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reason_code" VARCHAR(50),
    "name_reason" VARCHAR(100),
    "group_reason_id" UUID NOT NULL,
    "unit_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reason_DisCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Email_ConfApplication" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email_name" VARCHAR(300),
    "unit_id" UUID,
    "email_subject" VARCHAR(255),
    "email_body" TEXT,
    "auto_send" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Email_ConfApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Email_Interview" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email_name" VARCHAR(300),
    "unit_id" UUID,
    "email_subject" VARCHAR(255),
    "email_body" TEXT,
    "auto_send" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Email_Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Email_Reject" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email_name" VARCHAR(300),
    "unit_id" UUID,
    "email_subject" VARCHAR(255),
    "email_body" TEXT,
    "auto_send" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Email_Reject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Email_ReApplication" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email_name" VARCHAR(300),
    "unit_id" UUID,
    "email_subject" VARCHAR(255),
    "email_body" TEXT,
    "auto_send" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Email_ReApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Email_Other" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email_name" VARCHAR(300),
    "unit_id" UUID,
    "email_subject" VARCHAR(255),
    "email_body" TEXT,
    "auto_send" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Email_Other_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Evaluation_Template" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "template_name" VARCHAR(200),
    "unit_id" UUID,
    "position_applied_id" UUID NOT NULL,
    "interview_script" TEXT,
    "criteria_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Evaluation_Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Evaluation_Criterias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "evaluation_template_id" UUID NOT NULL,
    "criteria_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "Setting_Evaluation_Criterias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Evaluation_Criteria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "criteria_name" VARCHAR(200),
    "guide_crite" TEXT,
    "type_criteria" VARCHAR(100),
    "request_pass_fail" BOOLEAN NOT NULL DEFAULT false,
    "include_in_conclusion" BOOLEAN NOT NULL DEFAULT false,
    "weight" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Evaluation_Criteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Criteria_Suggest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "criteria_id" UUID NOT NULL,
    "suggestion_text" TEXT,
    "order_index" INTEGER NOT NULL,

    CONSTRAINT "Setting_Criteria_Suggest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Example_Prepareration" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "example_name" VARCHAR(200),
    "unit_id" UUID,
    "position_applied_id" UUID NOT NULL,
    "example_text" TEXT,
    "order_index" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Example_Prepareration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Example_Subject" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "example_prepareration_id" UUID NOT NULL,
    "subject_text" TEXT,
    "order_index" INTEGER NOT NULL,
    "note" TEXT,

    CONSTRAINT "Setting_Example_Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_JobEmailOffer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "offer_name" VARCHAR(200),
    "unit_id" UUID,
    "offer_subject" VARCHAR(255),
    "offer_body" TEXT,
    "letter_template" TEXT,
    "file_letter_template" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_JobEmailOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_code" VARCHAR(50),
    "candidate_name" VARCHAR(300),
    "date_of_birth" DATE,
    "gender" VARCHAR(50),
    "phone_number" VARCHAR(15),
    "email" VARCHAR(100),
    "address" TEXT,
    "country" VARCHAR(100),
    "provice" VARCHAR(100),
    "district" VARCHAR(100),
    "date_applied" DATE,
    "source_channel_id" UUID NOT NULL,
    "position_applied_id" UUID NOT NULL,
    "referrer_id" UUID NOT NULL,
    "process_id" UUID NOT NULL,
    "recruitment_infor_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate_Experience" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "company_name" VARCHAR(200),
    "position" VARCHAR(100),
    "from_month" DATE,
    "to_month" DATE,
    "job_description" TEXT,

    CONSTRAINT "Candidate_Experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate_Education" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "candidate_id" UUID NOT NULL,
    "training_level_id" UUID NOT NULL,
    "training_place_id" UUID NOT NULL,
    "specialization_id" UUID NOT NULL,
    "major" VARCHAR(100),
    "from_year" INTEGER NOT NULL,
    "to_year" INTEGER NOT NULL,

    CONSTRAINT "Candidate_Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedules_Type" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type_name" VARCHAR(100),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Schedules_Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting_Exam_Online" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exam_name" VARCHAR(200),
    "description" TEXT,
    "duration_minutes" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "passing_score" DOUBLE PRECISION NOT NULL,
    "file_exam" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Setting_Exam_Online_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeSchedules_Link" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type_schedule_id" UUID NOT NULL,
    "exam_link" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypeSchedules_Link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeSchedules_OnlineExam" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type_schedule_id" UUID NOT NULL,
    "date_exam" TIMESTAMP(6),
    "start_at" TIMESTAMP(6),
    "end_at" TIMESTAMP(6),
    "exam_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TypeSchedules_OnlineExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview_Schedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "interview_date" TIMESTAMP(6),
    "interview_location" TEXT,
    "interview_room" VARCHAR(100),
    "time_duration" INTEGER NOT NULL,
    "times" TIMESTAMP(6),
    "type_schedule_id" UUID NOT NULL,
    "evaluation_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interview_Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedule_Interviewers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "interview_schedule_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,

    CONSTRAINT "Schedule_Interviewers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schedules_Candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "interview_schedule_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,

    CONSTRAINT "Schedules_Candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_job" VARCHAR(200),
    "description_job" TEXT,
    "type_job" VARCHAR(100),
    "result_job" VARCHAR(100),
    "employee_id" UUID NOT NULL,
    "deadline" DATE,
    "remind_enabled" BOOLEAN NOT NULL DEFAULT false,
    "remind_before_minutes" INTEGER,
    "status" VARCHAR(50),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job_Candidates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,

    CONSTRAINT "Job_Candidates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PositionCompany_position_code_key" ON "PositionCompany"("position_code");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationLevel_name_level_key" ON "OrganizationLevel"("name_level");

-- CreateIndex
CREATE UNIQUE INDEX "Recruitment_Infor_recruitment_code_key" ON "Recruitment_Infor"("recruitment_code");

-- CreateIndex
CREATE UNIQUE INDEX "Recruitment_Plan_Child_Batches_batches_title_key" ON "Recruitment_Plan_Child_Batches"("batches_title");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Position_Posts_position_code_key" ON "Setting_Position_Posts"("position_code");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Process_Recruitment_name_process_key" ON "Setting_Process_Recruitment"("name_process");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Channel_Recruitment_channel_code_key" ON "Setting_Channel_Recruitment"("channel_code");

-- CreateIndex
CREATE UNIQUE INDEX "Rank_rank_code_key" ON "Rank"("rank_code");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Training_Level_level_code_key" ON "Setting_Training_Level"("level_code");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Training_Place_place_code_key" ON "Setting_Training_Place"("place_code");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_Specialization_specialization_code_key" ON "Setting_Specialization"("specialization_code");

-- CreateIndex
CREATE UNIQUE INDEX "GroupReason_DisCandidate_group_reason_code_key" ON "GroupReason_DisCandidate"("group_reason_code");

-- CreateIndex
CREATE UNIQUE INDEX "Reason_DisCandidate_reason_code_key" ON "Reason_DisCandidate"("reason_code");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_candidate_code_key" ON "Candidate"("candidate_code");

-- AddForeignKey
ALTER TABLE "PositionCompany" ADD CONSTRAINT "PositionCompany_org_unit_id_fkey" FOREIGN KEY ("org_unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Infor" ADD CONSTRAINT "Recruitment_Infor_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Infor" ADD CONSTRAINT "Recruitment_Infor_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "Rank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Infor" ADD CONSTRAINT "Recruitment_Infor_work_location_id_fkey" FOREIGN KEY ("work_location_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Infor" ADD CONSTRAINT "Recruitment_Infor_contact_person_id_fkey" FOREIGN KEY ("contact_person_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Plan_Parent" ADD CONSTRAINT "Recruitment_Plan_Parent_recruitment_id_fkey" FOREIGN KEY ("recruitment_id") REFERENCES "Recruitment_Infor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Plan_Child_Batches" ADD CONSTRAINT "Recruitment_Plan_Child_Batches_recruitment_plan_parent_id_fkey" FOREIGN KEY ("recruitment_plan_parent_id") REFERENCES "Recruitment_Plan_Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Plan_Child_Posted" ADD CONSTRAINT "Recruitment_Plan_Child_Posted_recruitment_plan_parent_id_fkey" FOREIGN KEY ("recruitment_plan_parent_id") REFERENCES "Recruitment_Plan_Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruitment_Costs" ADD CONSTRAINT "Recruitment_Costs_recruitment_id_fkey" FOREIGN KEY ("recruitment_id") REFERENCES "Recruitment_Infor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Position_Posts" ADD CONSTRAINT "Setting_Position_Posts_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Channel_Recruitment" ADD CONSTRAINT "Setting_Channel_Recruitment_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rank" ADD CONSTRAINT "Rank_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate_Card" ADD CONSTRAINT "Candidate_Card_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reason_DisCandidate" ADD CONSTRAINT "Reason_DisCandidate_group_reason_id_fkey" FOREIGN KEY ("group_reason_id") REFERENCES "GroupReason_DisCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reason_DisCandidate" ADD CONSTRAINT "Reason_DisCandidate_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Email_ConfApplication" ADD CONSTRAINT "Setting_Email_ConfApplication_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Email_Interview" ADD CONSTRAINT "Setting_Email_Interview_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Email_Reject" ADD CONSTRAINT "Setting_Email_Reject_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Email_ReApplication" ADD CONSTRAINT "Setting_Email_ReApplication_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Email_Other" ADD CONSTRAINT "Setting_Email_Other_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Evaluation_Template" ADD CONSTRAINT "Setting_Evaluation_Template_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "Setting_Evaluation_Criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Evaluation_Template" ADD CONSTRAINT "Setting_Evaluation_Template_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Evaluation_Template" ADD CONSTRAINT "Setting_Evaluation_Template_position_applied_id_fkey" FOREIGN KEY ("position_applied_id") REFERENCES "Setting_Position_Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Evaluation_Criterias" ADD CONSTRAINT "Setting_Evaluation_Criterias_evaluation_template_id_fkey" FOREIGN KEY ("evaluation_template_id") REFERENCES "Setting_Evaluation_Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Evaluation_Criterias" ADD CONSTRAINT "Setting_Evaluation_Criterias_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "Setting_Evaluation_Criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Criteria_Suggest" ADD CONSTRAINT "Setting_Criteria_Suggest_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "Setting_Evaluation_Criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Example_Prepareration" ADD CONSTRAINT "Setting_Example_Prepareration_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Example_Prepareration" ADD CONSTRAINT "Setting_Example_Prepareration_position_applied_id_fkey" FOREIGN KEY ("position_applied_id") REFERENCES "Setting_Position_Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_Example_Subject" ADD CONSTRAINT "Setting_Example_Subject_example_prepareration_id_fkey" FOREIGN KEY ("example_prepareration_id") REFERENCES "Setting_Example_Prepareration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting_JobEmailOffer" ADD CONSTRAINT "Setting_JobEmailOffer_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "InforCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_recruitment_infor_id_fkey" FOREIGN KEY ("recruitment_infor_id") REFERENCES "Recruitment_Infor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_source_channel_id_fkey" FOREIGN KEY ("source_channel_id") REFERENCES "Setting_Channel_Recruitment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_position_applied_id_fkey" FOREIGN KEY ("position_applied_id") REFERENCES "Setting_Position_Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "Setting_Process_Recruitment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate_Experience" ADD CONSTRAINT "Candidate_Experience_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate_Education" ADD CONSTRAINT "Candidate_Education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate_Education" ADD CONSTRAINT "Candidate_Education_training_level_id_fkey" FOREIGN KEY ("training_level_id") REFERENCES "Setting_Training_Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate_Education" ADD CONSTRAINT "Candidate_Education_training_place_id_fkey" FOREIGN KEY ("training_place_id") REFERENCES "Setting_Training_Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate_Education" ADD CONSTRAINT "Candidate_Education_specialization_id_fkey" FOREIGN KEY ("specialization_id") REFERENCES "Setting_Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeSchedules_Link" ADD CONSTRAINT "TypeSchedules_Link_type_schedule_id_fkey" FOREIGN KEY ("type_schedule_id") REFERENCES "Schedules_Type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeSchedules_OnlineExam" ADD CONSTRAINT "TypeSchedules_OnlineExam_type_schedule_id_fkey" FOREIGN KEY ("type_schedule_id") REFERENCES "Schedules_Type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeSchedules_OnlineExam" ADD CONSTRAINT "TypeSchedules_OnlineExam_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Setting_Exam_Online"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview_Schedule" ADD CONSTRAINT "Interview_Schedule_type_schedule_id_fkey" FOREIGN KEY ("type_schedule_id") REFERENCES "Schedules_Type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview_Schedule" ADD CONSTRAINT "Interview_Schedule_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "Setting_Evaluation_Template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Interviewers" ADD CONSTRAINT "Schedule_Interviewers_interview_schedule_id_fkey" FOREIGN KEY ("interview_schedule_id") REFERENCES "Interview_Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule_Interviewers" ADD CONSTRAINT "Schedule_Interviewers_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedules_Candidates" ADD CONSTRAINT "Schedules_Candidates_interview_schedule_id_fkey" FOREIGN KEY ("interview_schedule_id") REFERENCES "Interview_Schedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedules_Candidates" ADD CONSTRAINT "Schedules_Candidates_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job_Candidates" ADD CONSTRAINT "Job_Candidates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job_Candidates" ADD CONSTRAINT "Job_Candidates_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
