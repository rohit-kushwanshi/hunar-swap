import { Router } from "express";
import { db, requestsTable, usersTable, skillsTable } from "../lib/db";
import { eq, or } from "drizzle-orm";
import { CreateRequestBody, UpdateRequestBody } from "../lib/validators";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

async function enrichRequest(req: typeof requestsTable.$inferSelect) {
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req.senderId)).limit(1);
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, req.receiverId)).limit(1);
  let skillTitle: string | null = null;
  if (req.skillId) {
    const [skill] = await db.select().from(skillsTable).where(eq(skillsTable.id, req.skillId)).limit(1);
    skillTitle = skill?.title ?? null;
  }
  return { ...req, senderName: sender?.name ?? null, senderPhoto: sender?.profilePhoto ?? null, receiverName: receiver?.name ?? null, skillTitle };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const { type, status } = req.query as { type?: string; status?: string };
  const userId = req.userId!;
  let rows: typeof requestsTable.$inferSelect[];
  if (type === "sent") {
    rows = await db.select().from(requestsTable).where(eq(requestsTable.senderId, userId));
  } else if (type === "received") {
    rows = await db.select().from(requestsTable).where(eq(requestsTable.receiverId, userId));
  } else {
    rows = await db.select().from(requestsTable).where(
      or(eq(requestsTable.senderId, userId), eq(requestsTable.receiverId, userId))!
    );
  }
  if (status) rows = rows.filter(r => r.status === status);
  const enriched = await Promise.all(rows.map(enrichRequest));
  res.json(enriched);
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const { receiverId, skillId, message } = parsed.data;
  if (receiverId === req.userId) { res.status(400).json({ error: "Cannot send request to yourself" }); return; }
  const [newReq] = await db.insert(requestsTable).values({
    senderId: req.userId!, receiverId, skillId: skillId ?? null, message: message ?? null,
  }).returning();
  const enriched = await enrichRequest(newReq);
  res.status(201).json(enriched);
});

router.get("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }
  if (request.senderId !== req.userId && request.receiverId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  res.json(await enrichRequest(request));
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }
  if (request.receiverId !== req.userId) { res.status(403).json({ error: "Only receiver can update status" }); return; }
  const parsed = UpdateRequestBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const [updated] = await db.update(requestsTable).set({ status: parsed.data.status }).where(eq(requestsTable.id, id)).returning();
  res.json(await enrichRequest(updated));
});

export default router;
