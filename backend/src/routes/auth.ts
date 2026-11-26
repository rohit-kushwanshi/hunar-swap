import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "../lib/db";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "../lib/validators";
import { requireAuth, signToken, AuthRequest } from "../middlewares/auth";

const router = Router();

router.post("/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
    return;
  }
  const { name, email, password, profilePhoto } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name, email, passwordHash, profilePhoto: profilePhoto ?? null, skills: [],
  }).returning();
  const token = signToken(user.id);
  res.status(201).json({ user: serializeUser(user), token });
});

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) { res.status(401).json({ error: "Invalid email or password" }); return; }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid email or password" }); return; }
  const token = signToken(user.id);
  res.json({ user: serializeUser(user), token });
});

router.post("/logout", (_req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) { res.status(401).json({ error: "User not found" }); return; }
  res.json(serializeUser(user));
});

export function serializeUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id, name: user.name, email: user.email, bio: user.bio,
    address: user.address, profilePhoto: user.profilePhoto,
    skills: user.skills ?? [], rating: user.rating,
    isVerified: user.isVerified, createdAt: user.createdAt,
  };
}

export default router;
