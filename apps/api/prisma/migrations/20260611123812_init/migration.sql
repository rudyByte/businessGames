-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rollNumber" TEXT,
    "avatarUrl" TEXT,
    "avatarConfig" TEXT,
    "schoolId" TEXT NOT NULL,
    "classroomId" TEXT,
    "totalXP" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "students_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "students_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "faculty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "faculty_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "parents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "parents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "super_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "student_parent_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    CONSTRAINT "student_parent_links_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_parent_links_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "parents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "boardType" TEXT NOT NULL DEFAULT 'CBSE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "grade" INTEGER NOT NULL DEFAULT 7,
    "section" TEXT,
    "schoolId" TEXT NOT NULL,
    "facultyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "classrooms_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "classrooms_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "games" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "totalChapters" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "curriculumRef" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "coinReward" INTEGER NOT NULL DEFAULT 50,
    "unlockCondition" TEXT,
    CONSTRAINT "chapters_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "levels" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chapterId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" TEXT NOT NULL,
    "maxScore" INTEGER NOT NULL DEFAULT 1000,
    "passingScore" INTEGER NOT NULL DEFAULT 600,
    "timeLimit" INTEGER,
    CONSTRAINT "levels_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game_progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "currentChapter" INTEGER NOT NULL DEFAULT 1,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "totalXPEarned" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME,
    "detectiveSave" TEXT,
    "simulatorSave" TEXT,
    CONSTRAINT "game_progress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "game_progress_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "level_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "progressId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "maxScore" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "choices" TEXT,
    "aiHintsUsed" INTEGER NOT NULL DEFAULT 0,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "level_attempts_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "game_progress" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "badgeColor" TEXT NOT NULL DEFAULT '#FFD700',
    "xpBonus" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT NOT NULL DEFAULT 'COMMON',
    "condition" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "student_achievements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "student_achievements_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "student_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "coin_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coin_transactions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "leaderboards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "scopeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "entries" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "facultyId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "gameSlug" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "dueDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "assignments_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "assignments_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "chapterRef" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "quiz_attempts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_userId_key" ON "students"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "faculty_userId_key" ON "faculty"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "parents_userId_key" ON "parents"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_userId_key" ON "super_admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "student_parent_links_studentId_parentId_key" ON "student_parent_links"("studentId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_gameId_number_key" ON "chapters"("gameId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "levels_chapterId_number_key" ON "levels"("chapterId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "game_progress_studentId_gameId_key" ON "game_progress"("studentId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_slug_key" ON "achievements"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "student_achievements_studentId_achievementId_key" ON "student_achievements"("studentId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "leaderboards_type_scopeId_period_key" ON "leaderboards"("type", "scopeId", "period");
