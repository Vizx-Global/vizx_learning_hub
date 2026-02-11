/*
  Warnings:

  - You are about to drop the column `category` on the `learning_paths` table. All the data in the column will be lost.
  - You are about to drop the column `subcategory` on the `learning_paths` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `modules` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `learning_paths_category_idx` ON `learning_paths`;

-- DropIndex
DROP INDEX `modules_category_idx` ON `modules`;

-- AlterTable
ALTER TABLE `learning_paths` DROP COLUMN `category`,
    DROP COLUMN `subcategory`,
    ADD COLUMN `categoryId` VARCHAR(36) NULL,
    ADD COLUMN `subCategoryId` VARCHAR(36) NULL;

-- AlterTable
ALTER TABLE `modules` DROP COLUMN `category`;

-- CreateTable
CREATE TABLE `categories` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `iconUrl` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_name_key`(`name`),
    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_categories` (
    `id` VARCHAR(36) NOT NULL,
    `categoryId` VARCHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sub_categories_categoryId_name_key`(`categoryId`, `name`),
    UNIQUE INDEX `sub_categories_categoryId_slug_key`(`categoryId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `learning_paths_categoryId_idx` ON `learning_paths`(`categoryId`);

-- CreateIndex
CREATE INDEX `learning_paths_subCategoryId_idx` ON `learning_paths`(`subCategoryId`);

-- AddForeignKey
ALTER TABLE `learning_paths` ADD CONSTRAINT `learning_paths_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learning_paths` ADD CONSTRAINT `learning_paths_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `sub_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_categories` ADD CONSTRAINT `sub_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
