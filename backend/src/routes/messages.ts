import { Router } from "express";
import { db, messagesTable, usersTable } from "../lib/db";
import { eq, or, and, desc } from "drizzle-orm";
import { SendMessageBody } from "../lib/validators";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/conversations", requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const msgs = await db.select().from(messagesTable)
    .where(or(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, userId))!)
    .orderBy(desc(messagesTable.createdAt));

  const conversationMap = new Map<number, typeof messagesTable.$inferSelect>();
  for (const msg of msgs) {
    const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (!conversationMap.has(otherId)) conversationMap.set(otherId, msg);
  }

  const conversations = await Promise.all(
    Array.from(conversationMap.entries()).map(async ([otherId, lastMsg]) => {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, otherId)).limit(1);
      const unreadCount = msgs.filter(m => m.senderId === otherId && m.receiverId === userId).length;
      return { userId: otherId, userName: user?.name ?? "Unknown", userPhoto: user?.profilePhoto ?? null, lastMessage: lastMsg.content, lastMessageAt: lastMsg.createdAt, unreadCount };
    })
  );
  res.json(conversations);
});

router.get("/:conversationUserId", requireAuth, async (req: AuthRequest, res) => {
  const otherId = parseInt(req.params.conversationUserId);
  if (isNaN(otherId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const userId = req.userId!;
  const msgs = await db.select().from(messagesTable)
    .where(
      or(
        and(eq(messagesTable.senderId, userId), eq(messagesTable.receiverId, otherId)),
        and(eq(messagesTable.senderId, otherId), eq(messagesTable.receiverId, userId))
      )!
    )
    .orderBy(messagesTable.createdAt);
  res.json(msgs);
});

router.post("/:conversationUserId", requireAuth, async (req: AuthRequest, res) => {
  const otherId = parseInt(req.params.conversationUserId);
  if (isNaN(otherId)) { res.status(400).json({ error: "Invalid user ID" }); return; }
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const [msg] = await db.insert(messagesTable).values({
    senderId: req.userId!, receiverId: otherId, content: parsed.data.content,
  }).returning();
  res.status(201).json(msg);
});

export default router;
