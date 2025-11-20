import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class DiscordAdapter implements Adapter {
    name = "discord";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.DISCORD_WEBHOOK_URL) {
            logger.warn("DISCORD_WEBHOOK_URL is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            // Discord webhook limit is 2000 chars.
            // We'll post title + description + link (if available) or just a summary.

            const content = `**${post.title}**\n\n${
                post.description || ""
            }\n\n${post.tags?.map((t) => `#${t}`).join(" ") || ""}`;

            await axios.post(process.env.DISCORD_WEBHOOK_URL!, {
                content: content.substring(0, 2000),
            });

            return {
                platform: this.name,
                success: true,
                url: "", // Webhooks don't return a URL
                postId: "",
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
