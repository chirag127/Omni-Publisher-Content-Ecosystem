import type { Post } from "../types.js";

/**
 * Format a social media post with title, excerpt, and link
 * CRITICAL: This function ensures URLs are NEVER truncated
 */
export function formatSocialPost(
    post: Post,
    maxLength: number = 500
): {
    message: string;
    excerpt: string;
    hashtags: string;
} {
    // Format hashtags first (limit to 3 tags)
    const hashtags =
        post.tags
            ?.slice(0, 3)
            .map((tag) => `#${tag.replace(/\s+/g, "")}`) // Remove spaces from tags
            .join(" ") || "";

    // Calculate fixed components that MUST be included
    const urlSection = post.publishedUrl
        ? `Read more: ${post.publishedUrl}`
        : "";
    const hashtagSection = hashtags ? `\n${hashtags}` : "";

    // Calculate reserved space for CRITICAL components (URL + hashtags + structure)
    let reservedNewlines = 0;
    if (urlSection) reservedNewlines += 1; // newline before URL
    if (hashtags) reservedNewlines += 1; // newline before hashtags

    const reservedSpace =
        urlSection.length + hashtagSection.length + reservedNewlines;

    // Available space for title and excerpt
    const availableSpace = maxLength - reservedSpace;

    if (availableSpace <= 30) {
        // Not enough space for meaningful content - prioritize URL only
        const messageParts: string[] = [];
        if (urlSection) {
            messageParts.push(urlSection);
        }
        if (
            hashtags &&
            urlSection.length + hashtags.length + (urlSection ? 1 : 0) <=
                maxLength
        ) {
            if (urlSection) messageParts.push(""); // newline between URL and hashtags
            messageParts.push(hashtags);
        }

        const plainContent = post.content
            .replace(/[#*`_~\[\]]/g, "")
            .replace(/\n+/g, " ")
            .trim();
        const excerpt =
            plainContent.length > 150
                ? plainContent.substring(0, 147) + "..."
                : plainContent;

        return {
            message: messageParts.join("\n"),
            excerpt,
            hashtags,
        };
    }

    // Extract content for excerpt
    const plainContent = post.content
        .replace(/[#*`_~\[\]]/g, "") // Remove markdown formatting
        .replace(/\n+/g, " ") // Replace newlines with spaces
        .trim();

    // Title with emoji prefix
    const titlePrefix = "📝 New Blog Post: ";
    // Allocate space for title, ensuring at least 1 char for title if space allows
    const maxTitleLength = Math.max(
        0,
        Math.min(
            post.title.length,
            Math.floor(availableSpace * 0.4) - titlePrefix.length
        )
    );
    const title =
        post.title.length > maxTitleLength
            ? post.title.substring(0, maxTitleLength - 3) + "..."
            : post.title;
    const fullTitle = titlePrefix + title;

    // Calculate remaining space for excerpt (after title + potential newlines)
    // We need at least 1 newline after title if excerpt or URL/hashtags follow
    let currentUsedSpace = fullTitle.length;
    let excerpt = "";
    let excerptNewlineCount = 0;

    // If there's space for an excerpt, and we have content for it
    if (availableSpace - currentUsedSpace > 20) {
        // Need space for at least 20 chars + "..." + newline
        excerptNewlineCount = 1; // Add a newline between title and excerpt
        currentUsedSpace += excerptNewlineCount;

        const remainingForExcerpt = availableSpace - currentUsedSpace;
        const maxExcerptLength = Math.min(150, remainingForExcerpt);

        if (maxExcerptLength > 3) {
            // Ensure we have space for at least "..."
            excerpt =
                plainContent.length > maxExcerptLength
                    ? plainContent.substring(0, maxExcerptLength - 3) + "..."
                    : plainContent;
        }
    }

    // Build the final message with guaranteed complete URL
    const messageParts: string[] = [fullTitle];

    if (excerpt) {
        messageParts.push(""); // Newline after title, before excerpt
        messageParts.push(excerpt);
    }

    if (urlSection) {
        // Add newline before URL if there was an excerpt or title
        if (excerpt || fullTitle) {
            messageParts.push("");
        }
        messageParts.push(urlSection);
    }

    if (hashtags) {
        // Add newline before hashtags if there was a URL, excerpt, or title
        if (urlSection || excerpt || fullTitle) {
            messageParts.push("");
        }
        messageParts.push(hashtags);
    }

    const message = messageParts.join("\n");

    // Final safety check - this should NEVER trigger with correct logic above
    if (message.length > maxLength) {
        // Emergency fallback: Include only URL and hashtags
        const emergency: string[] = [];
        if (urlSection) {
            emergency.push(urlSection);
        }
        if (
            hashtags &&
            urlSection.length + hashtags.length + (urlSection ? 1 : 0) <=
                maxLength
        ) {
            if (urlSection) emergency.push("");
            emergency.push(hashtags);
        }
        return {
            message: emergency.join("\n"),
            excerpt:
                plainContent.length > 150
                    ? plainContent.substring(0, 147) + "..."
                    : plainContent,
            hashtags,
        };
    }

    return { message, excerpt, hashtags };
}
