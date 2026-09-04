-- CreateTable
CREATE TABLE "MarketingDoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "templateKey" TEXT,
    "paletteIndex" INTEGER,
    "customBg" TEXT,
    "customFg" TEXT,
    "customAccent" TEXT,
    "useCustom" BOOLEAN NOT NULL DEFAULT false,
    "pages" JSONB NOT NULL,
    "savedToLibrary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MarketingDoc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HiddenTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    CONSTRAINT "HiddenTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "MarketingDoc_userId_kind_idx" ON "MarketingDoc"("userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "HiddenTemplate_userId_templateKey_key" ON "HiddenTemplate"("userId", "templateKey");
