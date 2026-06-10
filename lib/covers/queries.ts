import { getSignedCoverUrls } from "@/lib/covers/storage";

export async function resolveCoverSignedUrl(
  coverPath: string | null | undefined,
): Promise<string | null> {
  if (!coverPath) {
    return null;
  }

  const urls = await getSignedCoverUrls([coverPath]);
  return urls.get(coverPath) ?? null;
}

export async function attachCoverSignedUrls<
  T extends { coverPath: string | null },
>(
  items: T[],
): Promise<(T & { coverSignedUrl: string | null })[]> {
  const paths = items
    .map((item) => item.coverPath)
    .filter((path): path is string => Boolean(path));

  const urls = await getSignedCoverUrls(paths);

  return items.map((item) => ({
    ...item,
    coverSignedUrl: item.coverPath ? urls.get(item.coverPath) ?? null : null,
  }));
}
