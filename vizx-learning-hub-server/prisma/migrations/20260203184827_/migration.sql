/*
  Warnings:

  - The values [MICROSOFT_LEARN] on the enum `learning_paths_source` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `learning_paths` MODIFY `source` ENUM('CUSTOM', 'EXTERNAL') NOT NULL DEFAULT 'CUSTOM',
    MODIFY `provider` VARCHAR(50) NOT NULL DEFAULT 'Vizx Academy';
