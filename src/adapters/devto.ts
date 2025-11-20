import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class DevToAdapter implements Adapter {
    name = "devto";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.DEV_TO_API_KEY) {
            logger.warn("DEV_TO_API_KEY is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        let retries = 0;
        const maxRetries = 3;
        const defaultWaitTime = 30000; // 30 seconds

        while (retries <= maxRetries) {
            try {
                const response = await axios.post(
                    "https://dev.to/api/articles",
                    {
                        article: {
                            title: post.title,
                            body_markdown: post.content,
                            published: true,
                            tags: post.tags
                                ?.slice(0, 4) // Dev.to allows max 4 tags
                                .map(
                                    (tag) =>
                                        tag
                                            .toLowerCase()
                                            .replace(/\s+/g, "") // Remove all spaces
                                            .replace(/[^a-z0-9]/g, "") // Remove special chars except alphanumeric
                                ),
                            description: post.description,
                            cover_image: post.coverImage,
                        },
                    },
                    {
                        headers: {
                            "api-key": process.env.DEV_TO_API_KEY,
                            "Content-Type": "application/json",
                        },
                    }
                );

                return {
                    platform: this.name,
                    success: true,
                    url: response.data.url,
                    postId: response.data.id.toString(),
                };
            } catch (error: any) {
                if (error.response?.status === 429 && retries < maxRetries) {
                    const retryAfter = error.response.headers["retry-after"];
                    const waitTime = retryAfter
                        ? parseInt(retryAfter, 10) * 1000
                        : defaultWaitTime;

                    logger.warn(
                        `Dev.to rate limit reached. Retrying in ${
                            waitTime / 1000
                        }s... (Attempt ${retries + 1}/${maxRetries})`
                    );

                    await new Promise((resolve) =>
                        setTimeout(resolve, waitTime)
                    );
                    retries++;
                    continue;
                }

                return {
                    platform: this.name,
                    success: false,
                    error: error.response?.data?.error || error.message,
                };
            }
        }

        return {
            platform: this.name,
            success: false,
            error: "Max retries exceeded for Dev.to rate limit",
        };
    }
}
