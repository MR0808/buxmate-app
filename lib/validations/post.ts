import { z } from "zod";

export const POST_TYPES = ["ANNOUNCEMENT", "UPDATE", "NOTE"] as const;

export type PostTypeInput = (typeof POST_TYPES)[number];

export const createPostSchema = z.object({
  type: z.enum(POST_TYPES, { message: "Choose a post type" }),
  content: z
    .string()
    .trim()
    .min(1, "Write your update before posting")
    .max(1000, "Keep your update under 1,000 characters"),
  pinned: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
