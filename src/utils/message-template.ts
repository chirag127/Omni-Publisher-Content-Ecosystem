import type { Post } from "../types.js";

/**
 * Format a social media post with title, excerpt, and link
 */
export function formatSocialPost(
  post: Post,
  maxLength = 500,
): {
  message: string;
  excerpt: string;
  hashtags: string;
} {
  // Extract first 150 characters from content, removing markdown
  const plainContent = post.content
    .replace(/[#*`_~\[\]]/g, "") // Remove markdown formatting
    .replace(/\n+/g, " ") // Replace newlines with spaces
    .trim();

  const excerpt = plainContent.length > 150 ? plainContent.substring(0, 147) + "..." : plainContent;

  // Format hashtags
  const hashtags =
    post.tags
      ?.slice(0, 3) // Limit to 3 tags
      .map((tag) => `#${tag.replace(/\s+/g, "")}`) // Remove spaces from tags
      .join(" ") || "";

  // Build the message
  const messageParts: string[] = [`📝 New Blog Post: ${post.title}`, "", excerpt, ""];

  if (post.publishedUrl) {
    messageParts.push(`Read more: ${post.publishedUrl}`);
    messageParts.push("");
  }

  if (hashtags) {
    messageParts.push(hashtags);
  }

  const fullMessage = messageParts.join("\n");

  // Truncate if needed
  const message =
    fullMessage.length > maxLength ? fullMessage.substring(0, maxLength - 3) + "..." : fullMessage;

  return { message, excerpt, hashtags };
}
