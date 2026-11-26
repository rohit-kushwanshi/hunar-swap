import { Router } from "express";
import { db, usersTable } from "../lib/db";
import { eq } from "drizzle-orm";
import { UpdateUserBody } from "../lib/validators";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { serializeUser } from "./auth";

const router = Router();

router.get("/", async (req, res) => {
  const { search, skill } = req.query as { search?: string; skill?: string };
  let users = await db.select().from(usersTable);
  if (search) {
    users = users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (skill) {
    users = users.filter(u =>
      (u.skills ?? []).some(s => s.toLowerCase().includes(skill.toLowerCase()))
    );
  }
  res.json(users.map(serializeUser));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(serializeUser(user));
});

router.patch("/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id !== req.userId) { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Validation failed" }); return; }
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  const { name, bio, address, profilePhoto, skills } = parsed.data;
  if (name !== undefined) updates.name = name;
  if (bio !== undefined) updates.bio = bio;
  if (address !== undefined) updates.address = address;
  if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;
  if (skills !== undefined) updates.skills = skills;
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  res.json(serializeUser(updated));
});

export default router;
