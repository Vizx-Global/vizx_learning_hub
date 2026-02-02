/*
  Warnings:

  - A unique constraint covering the columns `[msLearnUid]` on the table `learning_paths` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[msLearnUid]` on the table `modules` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `learning_paths` ADD COLUMN `msLearnAudience` VARCHAR(100) NULL,
    ADD COLUMN `msLearnLevels` JSON NULL,
    ADD COLUMN `msLearnProducts` JSON NULL,
    ADD COLUMN `msLearnRoles` JSON NULL,
    ADD COLUMN `msLearnUid` VARCHAR(100) NULL,
    ADD COLUMN `msLearnUrl` VARCHAR(500) NULL,
    MODIFY `source` ENUM('MICROSOFT_LEARN', 'CUSTOM', 'EXTERNAL') NOT NULL DEFAULT 'CUSTOM',
    MODIFY `provider` VARCHAR(50) NOT NULL DEFAULT 'Microsoft Learn';

-- AlterTable
ALTER TABLE `modules` ADD COLUMN `msLearnUid` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `microsoft_learn_syncs` (
    `id` VARCHAR(36) NOT NULL,
    `syncType` VARCHAR(20) NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `itemsSynced` INTEGER NOT NULL DEFAULT 0,
    `itemsFailed` INTEGER NOT NULL DEFAULT 0,
    `duration` INTEGER NULL,
    `errorMessage` TEXT NULL,
    `errorDetails` JSON NULL,
    `syncModules` BOOLEAN NOT NULL DEFAULT true,
    `syncPaths` BOOLEAN NOT NULL DEFAULT true,
    `syncAssessments` BOOLEAN NOT NULL DEFAULT true,
    `languages` JSON NULL,
    `forceUpdate` BOOLEAN NOT NULL DEFAULT false,
    `triggeredBy` VARCHAR(36) NULL,
    `triggerSource` VARCHAR(20) NOT NULL DEFAULT 'MANUAL',

    INDEX `microsoft_learn_syncs_status_idx`(`status`),
    INDEX `microsoft_learn_syncs_startedAt_idx`(`startedAt`),
    INDEX `microsoft_learn_syncs_triggeredBy_idx`(`triggeredBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `microsoft_learn_api_logs` (
    `id` VARCHAR(36) NOT NULL,
    `endpoint` VARCHAR(200) NOT NULL,
    `method` VARCHAR(10) NOT NULL,
    `statusCode` INTEGER NOT NULL,
    `responseTime` INTEGER NOT NULL,
    `syncedItems` INTEGER NULL,
    `errorMessage` TEXT NULL,
    `requestParams` JSON NULL,
    `responseData` JSON NULL,
    `syncId` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `microsoft_learn_api_logs_endpoint_idx`(`endpoint`),
    INDEX `microsoft_learn_api_logs_statusCode_idx`(`statusCode`),
    INDEX `microsoft_learn_api_logs_createdAt_idx`(`createdAt`),
    INDEX `microsoft_learn_api_logs_syncId_idx`(`syncId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `learning_paths_msLearnUid_key` ON `learning_paths`(`msLearnUid`);

-- CreateIndex
CREATE INDEX `learning_paths_msLearnUid_idx` ON `learning_paths`(`msLearnUid`);

-- CreateIndex
CREATE UNIQUE INDEX `modules_msLearnUid_key` ON `modules`(`msLearnUid`);

-- AddForeignKey
ALTER TABLE `microsoft_learn_api_logs` ADD CONSTRAINT `microsoft_learn_api_logs_syncId_fkey` FOREIGN KEY (`syncId`) REFERENCES `microsoft_learn_syncs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
