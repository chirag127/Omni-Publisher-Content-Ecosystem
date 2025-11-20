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
        try {
            const response = await axios.post(
                "https://dev.to/api/articles",
                {
                    article: {
                        title: post.title,
                        body_markdown: post.content,
                        published: true,
                        tags: post.tags,
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
            return {
                platform: this.name,
                success: false,
                error: error.response?.data?.error || error.message,
            };
        }
    }
}
