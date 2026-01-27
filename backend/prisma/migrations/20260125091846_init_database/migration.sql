-- CreateEnum
CREATE TYPE "GenderEmployee" AS ENUM ('Male', 'Femail');

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name_role" CHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "employee_name" CHAR(300),
    "password" CHAR(100) NOT NULL,
    "date_of_birth" DATE,
    "gender" "GenderEmployee",
    "address" TEXT,
    "email" CHAR(100),
    "work_unit" TEXT,
    "position" TEXT,
    "job_title" CHAR(50),
    "director_id" UUID,
    "status" CHAR(50) NOT NULL,
    "first_day_of_work" DATE,
    "official_date" DATE,
    "phone_unit" CHAR(15),
    "email_unit" CHAR(100),
    "email_account" CHAR(100),
    "phone_account" CHAR(15),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeRole" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_role" UUID NOT NULL,
    "id_employee" UUID NOT NULL,

    CONSTRAINT "EmployeeRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InforCompany" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "full_name" CHAR(255) NOT NULL,
    "acronym_name" CHAR(50) NOT NULL,
    "business_type" CHAR(100) NOT NULL,
    "tax_idennumber" CHAR(13) NOT NULL,
    "code_company" CHAR(10) NOT NULL,
    "date_stablish" DATE NOT NULL,
    "image_logo" TEXT NOT NULL,
    "code_business" CHAR(50) NOT NULL,
    "date_of_issue" DATE NOT NULL,
    "place_of_issue" TEXT NOT NULL,
    "unit_title" CHAR(255) NOT NULL,
    "address" TEXT NOT NULL,
    "phone_number" CHAR(15) NOT NULL,
    "fax" CHAR(255) NOT NULL,
    "email" CHAR(255) NOT NULL,
    "website" CHAR(255) NOT NULL,
    "status" CHAR(100) NOT NULL,
    "parent_id" UUID,
    "organization_level" CHAR(255) NOT NULL,
    "number_arrange" INTEGER NOT NULL,
    "field_of_activity" CHAR(50) NOT NULL,

    CONSTRAINT "InforCompany_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_email_account_key" ON "Employee"("email_account");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_phone_account_key" ON "Employee"("phone_account");

-- CreateIndex
CREATE INDEX "EmployeeRole_id_role_idx" ON "EmployeeRole"("id_role");

-- CreateIndex
CREATE INDEX "EmployeeRole_id_employee_idx" ON "EmployeeRole"("id_employee");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeRole_id_role_id_employee_key" ON "EmployeeRole"("id_role", "id_employee");

-- CreateIndex
CREATE INDEX "InforCompany_parent_id_idx" ON "InforCompany"("parent_id");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_director_id_fkey" FOREIGN KEY ("director_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRole" ADD CONSTRAINT "EmployeeRole_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeRole" ADD CONSTRAINT "EmployeeRole_id_employee_fkey" FOREIGN KEY ("id_employee") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InforCompany" ADD CONSTRAINT "InforCompany_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "InforCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE;
