-- CreateTable
CREATE TABLE "localization_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "country" TEXT NOT NULL DEFAULT 'United States',
    "position" TEXT NOT NULL DEFAULT 'Header',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "localization_configs_shop_key" ON "localization_configs"("shop");
