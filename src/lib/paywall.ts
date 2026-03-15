import prisma from "./prisma";

const FREE_READS = 3;

export async function canAccessSpeech(
  userId: string | null,
  speechId: string
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
  // Not logged in — no access tracking, show preview only
  if (!userId) {
    return { allowed: false, remaining: 0, reason: "not_authenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      subscriptionEnd: true,
      role: true,
    },
  });

  if (!user) {
    return { allowed: false, remaining: 0, reason: "user_not_found" };
  }

  // Admin/editor always has access
  if (user.role === "ADMIN" || user.role === "EDITOR") {
    return { allowed: true, remaining: -1 };
  }

  // Active subscriber
  if (
    user.subscriptionStatus === "ACTIVE" &&
    (!user.subscriptionEnd || user.subscriptionEnd > new Date())
  ) {
    return { allowed: true, remaining: -1 };
  }

  // Check if this specific speech was already viewed (doesn't count against limit again)
  const existingView = await prisma.speechView.findUnique({
    where: {
      userId_speechId: { userId, speechId },
    },
  });

  if (existingView) {
    return { allowed: true, remaining: -1 };
  }

  // Count unique speech views
  const viewCount = await prisma.speechView.count({
    where: { userId },
  });

  const remaining = FREE_READS - viewCount;

  if (remaining > 0) {
    return { allowed: true, remaining: remaining - 1 };
  }

  return { allowed: false, remaining: 0, reason: "limit_reached" };
}

export async function recordSpeechView(
  userId: string,
  speechId: string
): Promise<void> {
  await prisma.speechView.upsert({
    where: {
      userId_speechId: { userId, speechId },
    },
    update: {},
    create: { userId, speechId },
  });
}

export async function getRemainingFreeReads(userId: string): Promise<number> {
  const viewCount = await prisma.speechView.count({
    where: { userId },
  });
  return Math.max(0, FREE_READS - viewCount);
}
