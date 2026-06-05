export type FeedPostType = "ANNOUNCEMENT" | "UPDATE" | "NOTE";

export const POST_TYPE_LABELS: Record<FeedPostType, string> = {
  ANNOUNCEMENT: "Announcement",
  UPDATE: "Update",
  NOTE: "Note",
};
