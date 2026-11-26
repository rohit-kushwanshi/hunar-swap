import { Router } from "express";
import { db, skillsTable, usersTable } from "../lib/db";
import { eq, sql } from "drizzle-orm";
import { CreateSkillBody, UpdateSkillBody } from "../lib/validators";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/categories", async (_req, res) => {
  const rows = await db
    .select({ category: skillsTable.category, count: sql<number>`count(*)::int` })
    .from(skillsTable)
    .groupBy(skillsTable.category);
  res.json(rows);
});

router.get("/", async (req, res) => {
  const { search, category, userId } = req.query as { search?: string; category?: string; userId?: string };
  let skills = await db
    .select({
      id: skillsTable.id, title: skillsTable.title, description: skillsTable.description,
      category: skillsTable.category, userId: skillsTable.userId, createdAt: skillsTable.createdAt,
      userName: usersTable.name, userPhoto: usersTable.profilePhoto, userRating: usersTable.rating,
    })
    .from(skillsTable)
    .leftJoin(usersTable, eq(skillsTable.userId, usersTable.id));

  if (search) {
    const s = search.toLowerCase();
    skills = skills.filter(sk =>
      sk.title.toLowerCase().includes(s) ||
      sk.description.toLowerCase().includes(s) ||
      sk.category.toLowerCase().includes(s)
    );
  }
  if (category) skills = skills.filter(sk => sk.category.toLowerCase() === category.toLowerCase());
  if (userId) {
    const uid = parseInt(userId);
    if (!isNaN(uid)) skills = skills.filter(sk => sk.userId === uid);
  }
  res.json(skills);
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = CreateSkillBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed", details: parsed.error.issues }); return; }
  const { title, description, category } = parsed.data;
  const [skill] = await db.insert(skillsTable).values({ title, description, category, userId: req.userId! }).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  res.status(201).json({ ...skill, userName: user?.name ?? null, userPhoto: user?.profilePhoto ?? null, userRating: user?.rating ?? null });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [skill] = await db
    .select({
      id: skillsTable.id, title: skillsTable.title, description: skillsTable.description,
      category: skillsTable.category, userId: skillsTable.userId, createdAt: skillsTable.createdAt,
      userName: usersTable.name, userPhoto: usersTable.profilePhoto, userRating: usersTable.rating,
    })
    .from(skillsTable)
    .leftJoin(usersTable, eq(skillsTable.userId, usersTable.id))
    .where(eq(skillsTable.id, id))
    .limit(1);
  if (!skill) { res.status(404).json({ error: "Skill not found" }); return; }
  res.json(skill);
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [existing] = await db.select().from(skillsTable).where(eq(skillsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Skill not found" }); return; }
  if (existing.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = UpdateSkillBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const updates: Partial<typeof skillsTable.$inferInsert> = {};
  if (parsed.data.title) updates.title = parsed.data.title;
  if (parsed.data.description) updates.description = parsed.data.description;
  if (parsed.data.category) updates.category = parsed.data.category;
  const [updated] = await db.update(skillsTable).set(updates).where(eq(skillsTable.id, id)).returning();
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, updated.userId)).limit(1);
  res.json({ ...updated, userName: user?.name ?? null, userPhoto: user?.profilePhoto ?? null, userRating: user?.rating ?? null });
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [existing] = await db.select().from(skillsTable).where(eq(skillsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Skill not found" }); return; }
  if (existing.userId !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(skillsTable).where(eq(skillsTable.id, id));
  res.json({ message: "Skill deleted" });
});

export default router;
