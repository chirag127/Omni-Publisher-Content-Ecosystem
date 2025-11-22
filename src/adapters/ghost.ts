import GhostAdminAPI from "@tryghost/admin-api";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class GhostAdapter implements Adapter {
    name = "ghost";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.GHOST_API_URL || !process.env.GHOST_ADMIN_API_KEY) {
            logger.warn("GHOST credentials are missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const api = new GhostAdminAPI({
                url: process.env.GHOST_API_URL!,
                key: process.env.GHOST_ADMIN_API_KEY!,
                version: "v5.0",
            });

            // Convert markdown to HTML (Ghost prefers HTML or Mobiledoc)
            // But Ghost Admin API accepts 'html' field.
            // We'll use a simple markdown parser or just send it if Ghost handles it.
            // Ghost Admin API expects 'html' or 'mobiledoc'.
            // We can use the 'marked' library which is in package.json
            const { marked } = await import("marked");
            const html = await marked(post.content);

            const response = await api.posts.add(
                {
                    title: post.title,
                    html: html,
                    status: "published",
                    tags: post.tags
                        ? post.tags.map((tag) => ({ name: tag }))
                        : [],
                    feature_image: post.coverImage,
                },
                { source: "html" }
            );

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
                error: error.message || "Unknown Ghost error",
            };
        }
    }
}
