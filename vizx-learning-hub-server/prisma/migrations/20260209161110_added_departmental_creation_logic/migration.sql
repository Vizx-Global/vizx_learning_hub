/*
  Warnings:

  - You are about to drop the column `department` on the `cohorts` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `cohorts_department_idx` ON `cohorts`;

-- DropIndex
DROP INDEX `users_department_idx` ON `users`;

-- AlterTable
ALTER TABLE `cohorts` DROP COLUMN `department`,
    ADD COLUMN `departmentId` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `department`,
    ADD COLUMN `departmentId` VARCHAR(36) NULL;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `managerId` VARCHAR(36) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_name_key`(`name`),
    INDEX `departments_managerId_idx`(`managerId`),
    INDEX `departments_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `cohorts_departmentId_idx` ON `cohorts`(`departmentId`);

-- CreateIndex
CREATE INDEX `users_departmentId_idx` ON `users`(`departmentId`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `departments` ADD CONSTRAINT `departments_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cohorts` ADD CONSTRAINT `cohorts_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
