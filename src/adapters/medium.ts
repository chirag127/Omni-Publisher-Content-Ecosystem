import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class MediumAdapter implements Adapter {
    name = "medium";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.MEDIUM_TOKEN || !process.env.MEDIUM_USER_ID) {
            logger.warn("MEDIUM_TOKEN or MEDIUM_USER_ID is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            // Cloudflare bypass: Add comprehensive browser-like headers
            const response = await axios.post(
                `https://api.medium.com/v1/users/${process.env.MEDIUM_USER_ID}/posts`,
                {
                    title: post.title,
                    contentFormat: "markdown",
                    content: post.content,
                    tags: post.tags,
                    publishStatus: "public",
                    canonicalUrl: post.publishedUrl,
                },
                {
                    headers: {
                        // Authentication
                        Authorization: `Bearer ${process.env.MEDIUM_TOKEN}`,

                        // Content headers
                        "Content-Type": "application/json",
                        Accept: "application/json, text/plain, */*",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Accept-Encoding": "gzip, deflate, br",

                        // Browser-like headers to bypass Cloudflare
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
                        DNT: "1",
                        Connection: "keep-alive",
                        "Upgrade-Insecure-Requests": "1",

                        // Referer can help with Cloudflare
                        Referer: "https://medium.com/",

                        // Origin for CORS
                        Origin: "https://medium.com",
                    },
                    // Timeout to prevent hanging
                    timeout: 30000, // 30 seconds
                    // Disable automatic redirects
                    maxRedirects: 5,
                }
            );

            return {
                platform: this.name,
                success: true,
                url: response.data.data.url,
                postId: response.data.data.id,
            };
        } catch (error) {
            // Enhanced error logging for debugging with deprecation warning
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const status = error.response.status;
                    const data = error.response.data;

                    logger.error(
                        `Medium API Error (Status ${status}): ${JSON.stringify(
                            data
                        )}`
                    );

                    // Specific Cloudflare/403 error handling
                    if (
                        status === 403 ||
                        (typeof data === "string" &&
                            data.includes("cloudflare"))
                    ) {
                        logger.warn(
                            "Medium API blocked. CRITICAL: Medium API is CLOSED to new integrations as of Jan 2025."
                        );
                        logger.warn(
                            "Visit https://api.medium.com/v1/me in a browser to complete the challenge, then retry."
                        );
                    }
                } else {
                    logger.error(`Medium network error: ${error.message}`);
                }

                return {
                    platform: this.name,
                    success: false,
                    error:
                        (error.response?.data as any)?.errors?.[0]?.message ||
                        error.response?.statusText ||
                        (error.response?.status === 403
                            ? "Cloudflare blocked request - Medium API v1 is deprecated"
                            : JSON.stringify(error.response?.data)) ||
                        error.message,
                };
            }
            return {
                platform: this.name,
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
