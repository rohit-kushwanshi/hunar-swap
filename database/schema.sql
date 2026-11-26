-- Hunar Swap Database Schema
-- Run this in PostgreSQL to set up the database

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  bio TEXT,
  address TEXT,
  profile_photo TEXT,
  skills TEXT[] DEFAULT '{}',
  rating NUMERIC(3,1),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS requests (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id INTEGER REFERENCES skills(id) ON DELETE SET NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sample Data (optional)
-- password for all users is: password123
INSERT INTO users (name, email, password_hash, bio, address, skills, rating, is_verified)
VALUES
  ('Aryan Sharma', 'aryan@example.com', '$2b$10$V2wJahOXlcoVCzm4zD1hHuvy6FQZk3.Lx07mIec8a7fmBzDj/7IFO', 'Full-stack developer passionate about building cool things.', 'Mumbai, India', ARRAY['Coding','React','Node.js'], 4.8, true),
  ('Priya Singh', 'priya@example.com', '$2b$10$V2wJahOXlcoVCzm4zD1hHuvy6FQZk3.Lx07mIec8a7fmBzDj/7IFO', 'Graphic designer and illustrator.', 'Delhi, India', ARRAY['Design','Photoshop'], 4.6, true),
  ('Rohan Verma', 'rohan@example.com', '$2b$10$V2wJahOXlcoVCzm4zD1hHuvy6FQZk3.Lx07mIec8a7fmBzDj/7IFO', 'Music enthusiast teaching guitar for 5 years.', 'Bangalore, India', ARRAY['Guitar','Video Editing'], 4.9, false)
ON CONFLICT (email) DO NOTHING;

INSERT INTO skills (user_id, title, description, category) VALUES
  (1, 'React & Next.js Development', 'Modern React with hooks, context, and Next.js. Build full-stack apps from scratch.', 'Coding'),
  (1, 'Node.js & Express APIs', 'REST API design, Express middleware, JWT auth, and database integration.', 'Coding'),
  (2, 'UI/UX Design with Figma', 'Master Figma — components, auto-layout, prototyping, design systems.', 'Design'),
  (2, 'Adobe Photoshop & Illustrator', 'Photo editing, digital illustration, logo design. From basics to advanced.', 'Design'),
  (3, 'Acoustic Guitar for Beginners', 'Learn chords, strumming patterns, and songs from scratch.', 'Music'),
  (3, 'Video Editing with DaVinci Resolve', 'Professional video editing — cuts, color grading, transitions, audio mixing.', 'Video Editing');
