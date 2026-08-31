export const isRecentlyPublished = (
  publishedAt: string | Date,
  now = new Date(),
) => {
  const publishedDate = new Date(publishedAt);
  const elapsedTime = now.getTime() - publishedDate.getTime();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  return elapsedTime >= 0 && elapsedTime < twentyFourHours;
};
