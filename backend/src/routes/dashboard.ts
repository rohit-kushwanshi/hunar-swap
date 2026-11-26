import { Router } from "express";
import { db, skillsTable, requestsTable, messagesTable, usersTable } from "../lib/db";
import { eq, or, and, desc, count } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/stats", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const [{ count: totalSkills }] = await db.select({ count: count() }).from(skillsTable).where(eq(skillsTable.userId, userId));
  const [{ count: pendingRequests }] = await db.select({ count: count() }).from(requestsTable)
    .where(and(eq(requestsTable.receiverId, userId), eq(requestsTable.status, "pending"))!);
  const [{ count: acceptedRequests }] = await db.select({ count: count() }).from(requestsTable)
    .where(and(or(eq(requestsTable.senderId, userId), eq(requestsTable.receiverId, userId)), eq(requestsTable.status, "accepted"))!);
  const [{ count: totalMessages }] = await db.select({ count: count() }).from(messagesTable)
    .where(or(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, userId))!);
  const [{ count: unreadMessages }] = await db.select({ count: count() }).from(messagesTable)
    .where(eq(messagesTable.receiverId, userId));
  res.json({
    totalSkills: Number(totalSkills), pendingRequests: Number(pendingRequests),
    acceptedRequests: Number(acceptedRequests), totalMessages: Number(totalMessages),
    unreadMessages: Number(unreadMessages), profileViews: 0,
  });
});

router.get("/recent-activity", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const recentRequests = await db.select({
    id: requestsTable.id, senderId: requestsTable.senderId,
    status: requestsTable.status, createdAt: requestsTable.createdAt,
  })
    .from(requestsTable)
    .where(or(eq(requestsTable.receiverId, userId), eq(requestsTable.senderId, userId))!)
    .orderBy(desc(requestsTable.createdAt))
    .limit(5);

  const activities = await Promise.all(recentRequests.map(async (r) => {
    const [actor] = await db.select().from(usersTable).where(eq(usersTable.id, r.senderId)).limit(1);
    let type: string, message: string;
    if (r.senderId === userId) {
      type = "request_sent"; message = "You sent an exchange request";
    } else if (r.status === "accepted") {
      type = "request_accepted"; message = `${actor?.name ?? "Someone"} accepted your request`;
    } else {
      type = "request_received"; message = `${actor?.name ?? "Someone"} sent you an exchange request`;
    }
    return { id: r.id, type, message, actorName: actor?.name ?? null, actorPhoto: actor?.profilePhoto ?? null, createdAt: r.createdAt };
  }));
  res.json(activities);
});

router.get("/featured-skills", async (_req, res) => {
  const skills = await db.select({
    id: skillsTable.id, title: skillsTable.title, description: skillsTable.description,
    category: skillsTable.category, userId: skillsTable.userId, createdAt: skillsTable.createdAt,
    userName: usersTable.name, userPhoto: usersTable.profilePhoto, userRating: usersTable.rating,
  })
    .from(skillsTable)
    .leftJoin(usersTable, eq(skillsTable.userId, usersTable.id))
    .orderBy(desc(skillsTable.createdAt))
    .limit(8);
  res.json(skills);
});

export default router;
