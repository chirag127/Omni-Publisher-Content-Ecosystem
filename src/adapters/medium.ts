import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class MediumAdapter implements Adapter {
    name = "medium";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.MEDIUM_INTEGRATION_TOKEN ||
            !process.env.MEDIUM_USER_ID
        ) {
            logger.warn(
                "MEDIUM_INTEGRATION_TOKEN or MEDIUM_USER_ID is missing"
            );
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const response = await axios.post(
                `https://api.medium.com/v1/users/${process.env.MEDIUM_USER_ID}/posts`,
                {
                    title: post.title,
                    contentFormat: "markdown",
                    content: post.content,
                    tags: post.tags,
                    publishStatus: "public",
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.MEDIUM_INTEGRATION_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                platform: this.name,
                success: true,
                url: response.data.data.url,
                postId: response.data.data.id,
            };
        } catch (error: any) {
            // Enhanced error logging for debugging
            if (error.response) {
                logger.error(
                    `Medium publish error: ${JSON.stringify(
                        error.response.data
                    )}`
                );
            }
            return {
                platform: this.name,
                success: false,
                error:
                    error.response?.data?.errors?.[0]?.message ||
                    JSON.stringify(error.response?.data) ||
                    error.message,
            };
        }
    }
}
