import { z } from "zod";

export const caseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(2, "Description must be at least 2 characters"),
});

export const hearingSchema = z.object({
  title: z.string().min(2, "Title required"),
  date: z.string().min(1, "Date required"),
  notes: z.string().optional(),
});

export const taskSchema = z.object({
  text: z.string().min(2, "Task text required"),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
