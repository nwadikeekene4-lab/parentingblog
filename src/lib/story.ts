const MAX_EXCERPT_LENGTH = 200;

export function generateExcerpt(content: string): string {
  const plainText = content
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= MAX_EXCERPT_LENGTH) {
    return plainText;
  }

  const excerpt = plainText.slice(0, MAX_EXCERPT_LENGTH);

  const lastSpace = excerpt.lastIndexOf(" ");

  return `${excerpt.slice(0, lastSpace)}...`;
}
