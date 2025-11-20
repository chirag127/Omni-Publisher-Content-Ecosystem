import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { markdownToHtml } from "../utils/markdown.js";

export class TelegraphAdapter implements Adapter {
    name = "telegraph";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.TELEGRAPH_ACCESS_TOKEN) {
            logger.warn("TELEGRAPH_ACCESS_TOKEN is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            // Telegraph expects an array of Node objects.
            // We can use a simple conversion or just send text.
            // For better quality, we should convert markdown to Telegraph nodes.
            // But for now, we'll send it as a single paragraph of text (or HTML string if supported? No, it needs nodes).
            // We'll do a basic split by newlines to create paragraphs.

            const contentNodes = post.content.split("\n\n").map((para) => ({
                tag: "p",
                children: [para],
            }));

            const response = await axios.post(
                "https://api.telegra.ph/createPage",
                {
                    access_token: process.env.TELEGRAPH_ACCESS_TOKEN,
                    title: post.title,
                    content: JSON.stringify(contentNodes),
                    return_content: true,
                }
            );

            if (!response.data.ok) {
                throw new Error(response.data.error);
            }

            return {
                platform: this.name,
                success: true,
                url: response.data.result.url,
                postId: response.data.result.path,
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
