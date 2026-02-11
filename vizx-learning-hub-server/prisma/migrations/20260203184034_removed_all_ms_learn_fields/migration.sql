/*
  Warnings:

  - You are about to drop the column `msLearnAudience` on the `learning_paths` table. All the data in the column will be lost.
  - You are about to drop the column `msLearnLevels` on the `learning_paths` table. All the data in the column will be lost.
  - You are about to drop the column `msLearnProducts` on the `learning_paths` table. All the data in the column will be lost.
  - You are about to drop the column `msLearnRoles` on the `learning_paths` table. All the data in the column will be lost.
  - You are about to drop the column `msLearnUid` on the `learning_paths` table. All the data in the column will be lost.
  - You are about to drop the column `msLearnUrl` on the `learning_paths` table. All the data in the column will be lost.
  - You are about to drop the column `msLearnUid` on the `modules` table. All the data in the column will be lost.
  - You are about to drop the `microsoft_learn_api_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `microsoft_learn_syncs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `microsoft_learn_api_logs` DROP FOREIGN KEY `microsoft_learn_api_logs_syncId_fkey`;

-- DropIndex
DROP INDEX `learning_paths_msLearnUid_idx` ON `learning_paths`;

-- DropIndex
DROP INDEX `learning_paths_msLearnUid_key` ON `learning_paths`;

-- DropIndex
DROP INDEX `modules_msLearnUid_key` ON `modules`;

-- AlterTable
ALTER TABLE `learning_paths` DROP COLUMN `msLearnAudience`,
    DROP COLUMN `msLearnLevels`,
    DROP COLUMN `msLearnProducts`,
    DROP COLUMN `msLearnRoles`,
    DROP COLUMN `msLearnUid`,
    DROP COLUMN `msLearnUrl`;

-- AlterTable
ALTER TABLE `modules` DROP COLUMN `msLearnUid`;

-- DropTable
DROP TABLE `microsoft_learn_api_logs`;

-- DropTable
DROP TABLE `microsoft_learn_syncs`;
