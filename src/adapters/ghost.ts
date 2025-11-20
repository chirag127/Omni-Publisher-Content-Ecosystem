import GhostAdminAPI from "@tryghost/admin-api";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { markdownToHtml } from "../utils/markdown.js";

export class GhostAdapter implements Adapter {
    name = "ghost";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.GHOST_URL || !process.env.GHOST_ADMIN_KEY) {
            logger.warn("GHOST_URL or GHOST_ADMIN_KEY is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const api = new GhostAdminAPI({
                url: process.env.GHOST_URL!,
                key: process.env.GHOST_ADMIN_KEY!,
                version: "v5.0",
            });

            const response = await api.posts.add({
                title: post.title,
                html: markdownToHtml(post.content),
                status: "published",
                tags: post.tags?.map((tag) => ({ name: tag })),
                published_at: new Date(),
            });

            return {
                platform: this.name,
                success: true,
                url: response.url,
                postId: response.id,
            };
        } catch (error: any) {
            return {
                platform: this.name,
                success: false,
                error: error.message || JSON.stringify(error),
            };
        }
    }
}
