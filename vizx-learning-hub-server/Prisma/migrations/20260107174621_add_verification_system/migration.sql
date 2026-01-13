-- AlterTable
ALTER TABLE `activities` MODIFY `type` ENUM('MODULE_STARTED', 'MODULE_COMPLETED', 'QUIZ_PASSED', 'QUIZ_FAILED', 'ACHIEVEMENT_EARNED', 'STREAK_MILESTONE', 'LEVEL_UP', 'CERTIFICATE_EARNED', 'PATH_ENROLLED', 'PATH_COMPLETED', 'BADGE_EARNED', 'POINTS_EARNED', 'SOCIAL_INTERACTION', 'ACCOUNT_VERIFIED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED') NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `type` ENUM('ACHIEVEMENT', 'STREAK', 'MODULE_COMPLETION', 'PATH_COMPLETION', 'LEADERBOARD', 'SYSTEM', 'REMINDER', 'ASSIGNMENT', 'DEADLINE', 'SOCIAL', 'VERIFICATION', 'WELCOME', 'PASSWORD_RESET') NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `createdBy` VARCHAR(36) NULL,
    ADD COLUMN `emailVerificationCode` VARCHAR(10) NULL,
    ADD COLUMN `emailVerificationExpiry` DATETIME(3) NULL,
    MODIFY `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'VERIFICATION_PENDING') NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE `email_verifications` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email_verifications_userId_key`(`userId`),
    INDEX `email_verifications_code_idx`(`code`),
    INDEX `email_verifications_expiresAt_idx`(`expiresAt`),
    INDEX `email_verifications_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `users_role_idx` ON `users`(`role`);

-- CreateIndex
CREATE INDEX `users_createdBy_idx` ON `users`(`createdBy`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_verifications` ADD CONSTRAINT `email_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
