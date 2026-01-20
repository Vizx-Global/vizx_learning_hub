-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `employeeId` VARCHAR(50) NULL,
    `phone` VARCHAR(20) NULL,
    `avatar` VARCHAR(500) NULL,
    `department` VARCHAR(100) NULL,
    `jobTitle` VARCHAR(100) NULL,
    `managerId` VARCHAR(36) NULL,
    `role` ENUM('EMPLOYEE', 'MANAGER', 'ADMIN', 'CONTENT_CREATOR') NOT NULL DEFAULT 'EMPLOYEE',
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'VERIFICATION_PENDING') NOT NULL DEFAULT 'PENDING',
    `totalPoints` INTEGER NOT NULL DEFAULT 0,
    `currentLevel` INTEGER NOT NULL DEFAULT 1,
    `currentStreak` INTEGER NOT NULL DEFAULT 0,
    `longestStreak` INTEGER NOT NULL DEFAULT 0,
    `lastActiveDate` DATETIME(3) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `emailVerifiedAt` DATETIME(3) NULL,
    `emailVerificationCode` VARCHAR(10) NULL,
    `emailVerificationExpiry` DATETIME(3) NULL,
    `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
    `twoFactorSecret` VARCHAR(100) NULL,
    `passwordChangedAt` DATETIME(3) NULL,
    `mustChangePassword` BOOLEAN NOT NULL DEFAULT false,
    `createdBy` VARCHAR(36) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastLoginAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_employeeId_key`(`employeeId`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_employeeId_idx`(`employeeId`),
    INDEX `users_managerId_idx`(`managerId`),
    INDEX `users_department_idx`(`department`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_createdAt_idx`(`createdAt`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `user_preferences` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `learningStyle` VARCHAR(20) NULL DEFAULT 'visual',
    `preferredDifficulty` VARCHAR(20) NULL DEFAULT 'intermediate',
    `sessionDuration` INTEGER NULL DEFAULT 60,
    `dailyGoalMinutes` INTEGER NULL DEFAULT 120,
    `autoAdvance` BOOLEAN NOT NULL DEFAULT true,
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pushNotifications` BOOLEAN NOT NULL DEFAULT true,
    `achievementAlerts` BOOLEAN NOT NULL DEFAULT true,
    `weeklyReport` BOOLEAN NOT NULL DEFAULT true,
    `streakReminders` BOOLEAN NOT NULL DEFAULT true,
    `assignmentAlerts` BOOLEAN NOT NULL DEFAULT true,
    `shareProgress` BOOLEAN NOT NULL DEFAULT true,
    `showOnLeaderboard` BOOLEAN NOT NULL DEFAULT true,
    `allowAnalytics` BOOLEAN NOT NULL DEFAULT true,
    `theme` VARCHAR(10) NOT NULL DEFAULT 'light',
    `language` VARCHAR(10) NOT NULL DEFAULT 'en',
    `fontSize` VARCHAR(10) NOT NULL DEFAULT 'medium',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_preferences_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_key`(`token`),
    INDEX `sessions_userId_idx`(`userId`),
    INDEX `sessions_token_idx`(`token`),
    INDEX `sessions_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- CreateTable
CREATE TABLE `learning_paths` (
    `id` VARCHAR(36) NOT NULL,
    `msLearnUid` VARCHAR(100) NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `slug` VARCHAR(200) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `subcategory` VARCHAR(100) NULL,
    `difficulty` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') NOT NULL DEFAULT 'BEGINNER',
    `estimatedHours` DOUBLE NOT NULL,
    `minEstimatedHours` DOUBLE NULL,
    `maxEstimatedHours` DOUBLE NULL,
    `source` ENUM('MICROSOFT_LEARN', 'CUSTOM', 'EXTERNAL') NOT NULL DEFAULT 'CUSTOM',
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW') NOT NULL DEFAULT 'DRAFT',
    `provider` VARCHAR(50) NOT NULL DEFAULT 'Microsoft Learn',
    `thumbnailUrl` VARCHAR(500) NULL,
    `bannerUrl` VARCHAR(500) NULL,
    `iconUrl` VARCHAR(500) NULL,
    `prerequisites` JSON NULL,
    `learningObjectives` JSON NULL,
    `tags` JSON NULL,
    `skills` JSON NULL,
    `msLearnUrl` VARCHAR(500) NULL,
    `msLearnLevels` JSON NULL,
    `msLearnRoles` JSON NULL,
    `msLearnProducts` JSON NULL,
    `msLearnAudience` VARCHAR(100) NULL,
    `createdBy` VARCHAR(36) NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `featuredOrder` INTEGER NULL DEFAULT 0,
    `externalUrl` VARCHAR(500) NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `version` VARCHAR(20) NULL,
    `enrollmentCount` INTEGER NOT NULL DEFAULT 0,
    `completionCount` INTEGER NOT NULL DEFAULT 0,
    `averageRating` DOUBLE NULL,
    `ratingCount` INTEGER NOT NULL DEFAULT 0,
    `averageCompletionTime` DOUBLE NULL,
    `popularityScore` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `publishedAt` DATETIME(3) NULL,

    UNIQUE INDEX `learning_paths_msLearnUid_key`(`msLearnUid`),
    UNIQUE INDEX `learning_paths_slug_key`(`slug`),
    INDEX `learning_paths_category_idx`(`category`),
    INDEX `learning_paths_difficulty_idx`(`difficulty`),
    INDEX `learning_paths_status_idx`(`status`),
    INDEX `learning_paths_source_idx`(`source`),
    INDEX `learning_paths_isFeatured_idx`(`isFeatured`),
    INDEX `learning_paths_createdBy_idx`(`createdBy`),
    INDEX `learning_paths_createdAt_idx`(`createdAt`),
    INDEX `learning_paths_msLearnUid_idx`(`msLearnUid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modules` (
    `id` VARCHAR(36) NOT NULL,
    `msLearnUid` VARCHAR(100) NULL,
    `learningPathId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `slug` VARCHAR(200) NOT NULL,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `content` LONGTEXT NULL,
    `contentType` ENUM('TEXT', 'VIDEO', 'AUDIO', 'INTERACTIVE', 'DOCUMENT', 'QUIZ', 'ASSESSMENT', 'EXTERNAL_LINK') NOT NULL DEFAULT 'TEXT',
    `category` VARCHAR(100) NOT NULL,
    `difficulty` ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT') NOT NULL DEFAULT 'BEGINNER',
    `estimatedMinutes` INTEGER NOT NULL,
    `minEstimatedMinutes` INTEGER NULL,
    `maxEstimatedMinutes` INTEGER NULL,
    `videoUrl` VARCHAR(500) NULL,
    `audioUrl` VARCHAR(500) NULL,
    `documentUrl` VARCHAR(500) NULL,
    `externalLink` VARCHAR(500) NULL,
    `thumbnailUrl` VARCHAR(500) NULL,
    `resources` JSON NULL,
    `attachments` JSON NULL,
    `lastSyncedAt` DATETIME(3) NULL,
    `version` VARCHAR(20) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isOptional` BOOLEAN NOT NULL DEFAULT false,
    `requiresCompletion` BOOLEAN NOT NULL DEFAULT true,
    `prerequisites` JSON NULL,
    `learningObjectives` JSON NULL,
    `tags` JSON NULL,
    `keyConcepts` JSON NULL,
    `completionPoints` INTEGER NOT NULL DEFAULT 100,
    `maxQuizAttempts` INTEGER NULL DEFAULT 3,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `modules_msLearnUid_key`(`msLearnUid`),
    INDEX `modules_learningPathId_idx`(`learningPathId`),
    INDEX `modules_category_idx`(`category`),
    INDEX `modules_difficulty_idx`(`difficulty`),
    INDEX `modules_isActive_idx`(`isActive`),
    INDEX `modules_orderIndex_idx`(`orderIndex`),
    UNIQUE INDEX `modules_learningPathId_slug_key`(`learningPathId`, `slug`),
    UNIQUE INDEX `modules_learningPathId_orderIndex_key`(`learningPathId`, `orderIndex`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enrollments` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `learningPathId` VARCHAR(36) NOT NULL,
    `status` ENUM('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED', 'PAUSED') NOT NULL DEFAULT 'ENROLLED',
    `progress` DOUBLE NOT NULL DEFAULT 0,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `lastAccessedAt` DATETIME(3) NULL,
    `dueDate` DATETIME(3) NULL,
    `totalTimeSpent` INTEGER NOT NULL DEFAULT 0,
    `lastActivityAt` DATETIME(3) NULL,
    `certificateId` VARCHAR(36) NULL,
    `finalScore` DOUBLE NULL,
    `completionNotes` TEXT NULL,

    INDEX `enrollments_userId_idx`(`userId`),
    INDEX `enrollments_learningPathId_idx`(`learningPathId`),
    INDEX `enrollments_status_idx`(`status`),
    INDEX `enrollments_enrolledAt_idx`(`enrolledAt`),
    INDEX `enrollments_dueDate_idx`(`dueDate`),
    UNIQUE INDEX `enrollments_userId_learningPathId_key`(`userId`, `learningPathId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assigned_learning_paths` (
    `id` VARCHAR(36) NOT NULL,
    `learningPathId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `assignedById` VARCHAR(36) NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `instructions` TEXT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT false,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    `status` ENUM('ENROLLED', 'IN_PROGRESS', 'COMPLETED', 'DROPPED', 'PAUSED') NOT NULL DEFAULT 'ENROLLED',
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acknowledgedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,

    INDEX `assigned_learning_paths_userId_idx`(`userId`),
    INDEX `assigned_learning_paths_learningPathId_idx`(`learningPathId`),
    INDEX `assigned_learning_paths_assignedById_idx`(`assignedById`),
    INDEX `assigned_learning_paths_dueDate_idx`(`dueDate`),
    INDEX `assigned_learning_paths_status_idx`(`status`),
    UNIQUE INDEX `assigned_learning_paths_userId_learningPathId_key`(`userId`, `learningPathId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_progress` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `moduleId` VARCHAR(36) NOT NULL,
    `enrollmentId` VARCHAR(36) NOT NULL,
    `status` ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED') NOT NULL DEFAULT 'NOT_STARTED',
    `progress` DOUBLE NOT NULL DEFAULT 0,
    `timeSpent` INTEGER NOT NULL DEFAULT 0,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `lastAccessedAt` DATETIME(3) NULL,
    `quizScore` DOUBLE NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `bestScore` DOUBLE NULL,
    `pointsEarned` INTEGER NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `bookmarked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `module_progress_userId_idx`(`userId`),
    INDEX `module_progress_moduleId_idx`(`moduleId`),
    INDEX `module_progress_enrollmentId_idx`(`enrollmentId`),
    INDEX `module_progress_status_idx`(`status`),
    INDEX `module_progress_completedAt_idx`(`completedAt`),
    UNIQUE INDEX `module_progress_userId_moduleId_enrollmentId_key`(`userId`, `moduleId`, `enrollmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quizzes` (
    `id` VARCHAR(36) NOT NULL,
    `moduleId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `instructions` TEXT NULL,
    `timeLimit` INTEGER NULL,
    `passingScore` DOUBLE NOT NULL DEFAULT 70,
    `maxAttempts` INTEGER NULL DEFAULT 3,
    `shuffleQuestions` BOOLEAN NOT NULL DEFAULT true,
    `showResults` BOOLEAN NOT NULL DEFAULT true,
    `allowRetake` BOOLEAN NOT NULL DEFAULT true,
    `questions` JSON NOT NULL,
    `questionSettings` JSON NULL,
    `pointsAvailable` INTEGER NOT NULL DEFAULT 100,
    `difficultyBonus` INTEGER NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `quizzes_moduleId_idx`(`moduleId`),
    INDEX `quizzes_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_attempts` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `quizId` VARCHAR(36) NOT NULL,
    `enrollmentId` VARCHAR(36) NOT NULL,
    `attemptNumber` INTEGER NOT NULL DEFAULT 1,
    `score` DOUBLE NOT NULL,
    `passed` BOOLEAN NOT NULL,
    `percentage` DOUBLE NOT NULL,
    `answers` JSON NOT NULL,
    `questions` JSON NOT NULL,
    `detailedResults` JSON NULL,
    `timeSpent` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gradedBy` VARCHAR(36) NULL,
    `gradedAt` DATETIME(3) NULL,
    `feedback` TEXT NULL,

    INDEX `quiz_attempts_userId_idx`(`userId`),
    INDEX `quiz_attempts_quizId_idx`(`quizId`),
    INDEX `quiz_attempts_enrollmentId_idx`(`enrollmentId`),
    INDEX `quiz_attempts_attemptNumber_idx`(`attemptNumber`),
    INDEX `quiz_attempts_completedAt_idx`(`completedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `achievements` (
    `id` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('COMPLETION', 'STREAK', 'SPEED', 'SCORE', 'SOCIAL', 'MILESTONE', 'CUSTOM', 'MASTERY') NOT NULL,
    `rarity` ENUM('COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC') NOT NULL DEFAULT 'COMMON',
    `requirement` JSON NOT NULL,
    `points` INTEGER NOT NULL DEFAULT 100,
    `level` INTEGER NULL DEFAULT 1,
    `category` VARCHAR(50) NULL,
    `icon` VARCHAR(100) NULL,
    `badgeUrl` VARCHAR(500) NULL,
    `color` VARCHAR(20) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSecret` BOOLEAN NOT NULL DEFAULT false,
    `isStackable` BOOLEAN NOT NULL DEFAULT false,
    `maxProgress` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `achievements_type_idx`(`type`),
    INDEX `achievements_rarity_idx`(`rarity`),
    INDEX `achievements_category_idx`(`category`),
    INDEX `achievements_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_achievements` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `achievementId` VARCHAR(36) NOT NULL,
    `progress` DOUBLE NULL DEFAULT 0,
    `currentLevel` INTEGER NULL DEFAULT 1,
    `isUnlocked` BOOLEAN NOT NULL DEFAULT false,
    `unlockedAt` DATETIME(3) NULL,
    `earnedAt` DATETIME(3) NULL,

    INDEX `user_achievements_userId_idx`(`userId`),
    INDEX `user_achievements_achievementId_idx`(`achievementId`),
    INDEX `user_achievements_isUnlocked_idx`(`isUnlocked`),
    UNIQUE INDEX `user_achievements_userId_achievementId_key`(`userId`, `achievementId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `requirement` JSON NOT NULL,
    `category` VARCHAR(50) NULL,
    `tier` VARCHAR(20) NULL DEFAULT 'BRONZE',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `badges_category_idx`(`category`),
    INDEX `badges_tier_idx`(`tier`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_badges` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `badgeId` VARCHAR(36) NOT NULL,
    `earnedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sharedAt` DATETIME(3) NULL,

    INDEX `user_badges_userId_idx`(`userId`),
    INDEX `user_badges_badgeId_idx`(`badgeId`),
    UNIQUE INDEX `user_badges_userId_badgeId_key`(`userId`, `badgeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `streak_history` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `date` DATE NOT NULL,
    `completed` BOOLEAN NOT NULL DEFAULT true,
    `activityCount` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `streak_history_userId_idx`(`userId`),
    INDEX `streak_history_date_idx`(`date`),
    UNIQUE INDEX `streak_history_userId_date_key`(`userId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `points_transactions` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `type` ENUM('EARNED', 'SPENT', 'BONUS', 'PENALTY', 'ADJUSTMENT', 'REFUND') NOT NULL,
    `amount` INTEGER NOT NULL,
    `balance` INTEGER NOT NULL,
    `source` VARCHAR(50) NOT NULL,
    `sourceId` VARCHAR(36) NULL,
    `description` VARCHAR(200) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `points_transactions_userId_idx`(`userId`),
    INDEX `points_transactions_type_idx`(`type`),
    INDEX `points_transactions_source_idx`(`source`),
    INDEX `points_transactions_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `leaderboards` (
    `id` VARCHAR(36) NOT NULL,
    `period` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ALL_TIME') NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `name` VARCHAR(100) NULL,
    `rankings` JSON NOT NULL,
    `participantCount` INTEGER NOT NULL DEFAULT 0,
    `lastCalculated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `nextCalculation` DATETIME(3) NULL,

    INDEX `leaderboards_period_idx`(`period`),
    INDEX `leaderboards_startDate_endDate_idx`(`startDate`, `endDate`),
    INDEX `leaderboards_lastCalculated_idx`(`lastCalculated`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cohorts` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `avatar` VARCHAR(500) NULL,
    `type` VARCHAR(20) NOT NULL,
    `department` VARCHAR(100) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isPrivate` BOOLEAN NOT NULL DEFAULT false,
    `joinCode` VARCHAR(20) NULL,
    `memberCount` INTEGER NOT NULL DEFAULT 0,
    `activityScore` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cohorts_joinCode_key`(`joinCode`),
    INDEX `cohorts_type_idx`(`type`),
    INDEX `cohorts_department_idx`(`department`),
    INDEX `cohorts_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cohort_members` (
    `id` VARCHAR(36) NOT NULL,
    `cohortId` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cohort_members_cohortId_idx`(`cohortId`),
    INDEX `cohort_members_userId_idx`(`userId`),
    UNIQUE INDEX `cohort_members_cohortId_userId_key`(`cohortId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cohort_assignments` (
    `id` VARCHAR(36) NOT NULL,
    `cohortId` VARCHAR(36) NOT NULL,
    `learningPathId` VARCHAR(36) NOT NULL,
    `assignedById` VARCHAR(36) NOT NULL,
    `dueDate` DATETIME(3) NULL,
    `instructions` TEXT NULL,
    `isRequired` BOOLEAN NOT NULL DEFAULT true,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `cohort_assignments_cohortId_idx`(`cohortId`),
    INDEX `cohort_assignments_learningPathId_idx`(`learningPathId`),
    INDEX `cohort_assignments_dueDate_idx`(`dueDate`),
    UNIQUE INDEX `cohort_assignments_cohortId_learningPathId_key`(`cohortId`, `learningPathId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `certificateNumber` VARCHAR(50) NOT NULL,
    `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiryDate` DATETIME(3) NULL,
    `pdfUrl` VARCHAR(500) NULL,
    `template` VARCHAR(50) NULL,
    `learningPathId` VARCHAR(36) NULL,
    `moduleId` VARCHAR(36) NULL,
    `verificationCode` VARCHAR(100) NOT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT true,
    `issuedBy` VARCHAR(100) NOT NULL DEFAULT 'AI Learning Hub',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `certificates_certificateNumber_key`(`certificateNumber`),
    UNIQUE INDEX `certificates_verificationCode_key`(`verificationCode`),
    INDEX `certificates_userId_idx`(`userId`),
    INDEX `certificates_certificateNumber_idx`(`certificateNumber`),
    INDEX `certificates_issueDate_idx`(`issueDate`),
    INDEX `certificates_learningPathId_idx`(`learningPathId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `type` ENUM('ACHIEVEMENT', 'STREAK', 'MODULE_COMPLETION', 'PATH_COMPLETION', 'LEADERBOARD', 'SYSTEM', 'REMINDER', 'ASSIGNMENT', 'DEADLINE', 'SOCIAL', 'VERIFICATION', 'WELCOME', 'PASSWORD_RESET') NOT NULL,
    `status` ENUM('UNREAD', 'READ', 'ARCHIVED', 'DELETED') NOT NULL DEFAULT 'UNREAD',
    `title` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `summary` VARCHAR(500) NULL,
    `actionUrl` VARCHAR(500) NULL,
    `actionLabel` VARCHAR(50) NULL,
    `metadata` JSON NULL,
    `priority` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    `expiresAt` DATETIME(3) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `readAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_createdAt_idx`(`createdAt`),
    INDEX `notifications_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activities` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NOT NULL,
    `type` ENUM('MODULE_STARTED', 'MODULE_COMPLETED', 'QUIZ_PASSED', 'QUIZ_FAILED', 'ACHIEVEMENT_EARNED', 'STREAK_MILESTONE', 'LEVEL_UP', 'CERTIFICATE_EARNED', 'PATH_ENROLLED', 'PATH_COMPLETED', 'BADGE_EARNED', 'POINTS_EARNED', 'SOCIAL_INTERACTION', 'ACCOUNT_VERIFIED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'USER_LOGIN', 'USER_LOGOUT', 'VERIFICATION_SENT', 'VERIFICATION_RESENT', 'EMAIL_VERIFIED', 'PASSWORD_CHANGED_FORCED', 'PASSWORD_RESET_BY_ADMIN', 'PASSWORD_RESET_REQUESTED', 'USER_DEACTIVATED') NOT NULL,
    `description` TEXT NOT NULL,
    `metadata` JSON NULL,
    `pointsEarned` INTEGER NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activities_userId_idx`(`userId`),
    INDEX `activities_type_idx`(`type`),
    INDEX `activities_createdAt_idx`(`createdAt`),
    INDEX `activities_isPublic_idx`(`isPublic`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_configurations` (
    `id` VARCHAR(36) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `value` TEXT NOT NULL,
    `description` TEXT NULL,
    `valueType` VARCHAR(20) NOT NULL DEFAULT 'string',
    `isEditable` BOOLEAN NOT NULL DEFAULT true,
    `category` VARCHAR(50) NULL,
    `group` VARCHAR(50) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `updatedBy` VARCHAR(36) NULL,

    UNIQUE INDEX `system_configurations_key_key`(`key`),
    INDEX `system_configurations_category_idx`(`category`),
    INDEX `system_configurations_group_idx`(`group`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(36) NOT NULL,
    `userId` VARCHAR(36) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity` VARCHAR(50) NOT NULL,
    `entityId` VARCHAR(36) NULL,
    `oldValue` JSON NULL,
    `newValue` JSON NULL,
    `changes` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `location` VARCHAR(100) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_entity_idx`(`entity`),
    INDEX `audit_logs_entityId_idx`(`entityId`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_versions` (
    `id` VARCHAR(36) NOT NULL,
    `entityType` VARCHAR(50) NOT NULL,
    `entityId` VARCHAR(36) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` JSON NOT NULL,
    `changes` JSON NULL,
    `createdBy` VARCHAR(36) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `content_versions_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `content_versions_createdBy_idx`(`createdBy`),
    INDEX `content_versions_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `category` VARCHAR(50) NULL,
    `description` TEXT NULL,
    `color` VARCHAR(20) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    INDEX `tags_name_idx`(`name`),
    INDEX `tags_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_verifications` ADD CONSTRAINT `email_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `microsoft_learn_api_logs` ADD CONSTRAINT `microsoft_learn_api_logs_syncId_fkey` FOREIGN KEY (`syncId`) REFERENCES `microsoft_learn_syncs`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learning_paths` ADD CONSTRAINT `learning_paths_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modules` ADD CONSTRAINT `modules_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `learning_paths`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enrollments` ADD CONSTRAINT `enrollments_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `learning_paths`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assigned_learning_paths` ADD CONSTRAINT `assigned_learning_paths_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `learning_paths`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assigned_learning_paths` ADD CONSTRAINT `assigned_learning_paths_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assigned_learning_paths` ADD CONSTRAINT `assigned_learning_paths_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `module_progress` ADD CONSTRAINT `module_progress_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_quizId_fkey` FOREIGN KEY (`quizId`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quiz_attempts` ADD CONSTRAINT `quiz_attempts_enrollmentId_fkey` FOREIGN KEY (`enrollmentId`) REFERENCES `enrollments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_achievements` ADD CONSTRAINT `user_achievements_achievementId_fkey` FOREIGN KEY (`achievementId`) REFERENCES `achievements`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_badges` ADD CONSTRAINT `user_badges_badgeId_fkey` FOREIGN KEY (`badgeId`) REFERENCES `badges`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `streak_history` ADD CONSTRAINT `streak_history_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `points_transactions` ADD CONSTRAINT `points_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cohort_members` ADD CONSTRAINT `cohort_members_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `cohorts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cohort_members` ADD CONSTRAINT `cohort_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cohort_assignments` ADD CONSTRAINT `cohort_assignments_cohortId_fkey` FOREIGN KEY (`cohortId`) REFERENCES `cohorts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cohort_assignments` ADD CONSTRAINT `cohort_assignments_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `learning_paths`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cohort_assignments` ADD CONSTRAINT `cohort_assignments_assignedById_fkey` FOREIGN KEY (`assignedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_learningPathId_fkey` FOREIGN KEY (`learningPathId`) REFERENCES `learning_paths`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `activities` ADD CONSTRAINT `activities_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_versions` ADD CONSTRAINT `content_versions_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
