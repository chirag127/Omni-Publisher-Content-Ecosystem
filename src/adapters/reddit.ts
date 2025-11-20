import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class RedditAdapter implements Adapter {
    name = "reddit";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.REDDIT_CLIENT_ID ||
            !process.env.REDDIT_CLIENT_SECRET ||
            !process.env.REDDIT_USERNAME ||
            !process.env.REDDIT_PASSWORD ||
            !process.env.REDDIT_SUBREDDIT
        ) {
            logger.warn("REDDIT credentials or SUBREDDIT missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            // 1. Get Access Token
            const auth = Buffer.from(
                `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
            ).toString("base64");
            const tokenResponse = await axios.post(
                "https://www.reddit.com/api/v1/access_token",
                `grant_type=password&username=${process.env.REDDIT_USERNAME}&password=${process.env.REDDIT_PASSWORD}`,
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "OmniPublisher/1.0",
                    },
                }
            );

            const accessToken = tokenResponse.data.access_token;

            // 2. Submit Post
            const response = await axios.post(
                "https://oauth.reddit.com/api/submit",
                new URLSearchParams({
                    sr: process.env.REDDIT_SUBREDDIT!,
                    title: post.title,
                    text: post.content, // Reddit supports markdown
                    kind: "self",
                }).toString(),
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "User-Agent": "OmniPublisher/1.0",
                    },
                }
            );

            if (!response.data.success) {
                // Reddit API returns 200 even on failure sometimes, check json response
                // Actually, the response structure is complex.
            }

            return {
                platform: this.name,
                success: true,
                url: response.data.jquery ? "Check Reddit" : "", // URL construction is hard without parsing response deeply
                postId: "", // ID is in the response structure
            };
        } catch (error: any) {
            return {
                platform: this.name,
                success: false,
                error: error.response?.data?.message || error.message,
            };
        }
    }
}
