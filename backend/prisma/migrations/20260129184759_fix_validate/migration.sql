/*
  Warnings:

  - Made the column `created_at` on table `InforCompany` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updated_at` on table `InforCompany` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InforCompany" ALTER COLUMN "parent_id" DROP NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "updated_at" SET NOT NULL;
