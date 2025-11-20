import { Client } from "@hubspot/api-client";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { markdownToHtml } from "../utils/markdown.js";

export class HubSpotAdapter implements Adapter {
    name = "hubspot";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.HUBSPOT_ACCESS_TOKEN) {
            logger.warn("HUBSPOT_ACCESS_TOKEN is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const hubspotClient = new Client({
                accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
            });

            const blogPost = {
                name: post.title,
                postBody: markdownToHtml(post.content),
                state: "PUBLISHED",
                publishDate: Date.now(),
                contentGroupId: process.env.HUBSPOT_BLOG_ID || "", // Optional if only one blog exists, but better to have it
            };

            // If HUBSPOT_BLOG_ID is not provided, we might need to fetch it or let it fail/default.
            // The API requires contentGroupId usually.
            if (!blogPost.contentGroupId) {
                // Try to list blogs and pick the first one if not specified?
                // For strict safety, we should probably require it or log a warning.
                // Let's assume the user provides it or we try to proceed without it (might fail).
                logger.warn(
                    "HUBSPOT_BLOG_ID is missing, publish might fail if multiple blogs exist"
                );
            }

            const response =
                await hubspotClient.cms.blogs.blogPosts.blogPostsApi.create(
                    blogPost as any
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
                error: error.message || JSON.stringify(error),
            };
        }
    }
}
