import { z } from "zod";

export const RegisterBody = z.object({
  name:         z.string().min(2),
  email:        z.string().email(),
  password:     z.string().min(6),
  profilePhoto: z.string().optional(),
});

export const LoginBody = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

export const UpdateUserBody = z.object({
  name:         z.string().min(2).optional(),
  bio:          z.string().optional(),
  address:      z.string().optional(),
  profilePhoto: z.string().optional(),
  skills:       z.array(z.string()).optional(),
});

export const CreateSkillBody = z.object({
  title:       z.string().min(3),
  description: z.string().min(10),
  category:    z.string().min(1),
});

export const UpdateSkillBody = z.object({
  title:       z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category:    z.string().min(1).optional(),
});

export const CreateRequestBody = z.object({
  receiverId: z.number().int().positive(),
  skillId:    z.number().int().positive().optional(),
  message:    z.string().optional(),
});

export const UpdateRequestBody = z.object({
  status: z.enum(["accepted", "rejected"]),
});

export const SendMessageBody = z.object({
  content: z.string().min(1),
});
