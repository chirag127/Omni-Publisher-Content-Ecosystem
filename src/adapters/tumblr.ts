import oauth from "oauth-1.0a";
import crypto from "crypto";
import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class TumblrAdapter implements Adapter {
    name = "tumblr";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.TUMBLR_CONSUMER_KEY ||
            !process.env.TUMBLR_CONSUMER_SECRET ||
            !process.env.TUMBLR_TOKEN ||
            !process.env.TUMBLR_TOKEN_SECRET ||
            !process.env.TUMBLR_BLOG_IDENTIFIER
        ) {
            logger.warn("TUMBLR credentials or blog identifier missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const oauthClient = new oauth({
                consumer: {
                    key: process.env.TUMBLR_CONSUMER_KEY!,
                    secret: process.env.TUMBLR_CONSUMER_SECRET!,
                },
                signature_method: "HMAC-SHA1",
                hash_function(base_string, key) {
                    return crypto
                        .createHmac("sha1", key)
                        .update(base_string)
                        .digest("base64");
                },
            });

            const requestData = {
                url: `https://api.tumblr.com/v2/blog/${process.env.TUMBLR_BLOG_IDENTIFIER}/post`,
                method: "POST",
                data: {
                    type: "text",
                    title: post.title,
                    body: post.content, // Tumblr supports markdown with 'format' param
                    format: "markdown",
                    tags: post.tags?.join(","),
                    state: "published",
                },
            };

            const token = {
                key: process.env.TUMBLR_TOKEN!,
                secret: process.env.TUMBLR_TOKEN_SECRET!,
            };

            const authHeader = oauthClient.toHeader(
                oauthClient.authorize(requestData, token)
            );

            const response = await axios.post(
                requestData.url,
                new URLSearchParams(requestData.data as any).toString(),
                {
                    headers: {
                        ...authHeader,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            return {
                platform: this.name,
                success: true,
                url: `https://${process.env.TUMBLR_BLOG_IDENTIFIER}.tumblr.com/post/${response.data.response.id}`,
                postId: response.data.response.id.toString(),
            };
        } catch (error: any) {
            return {
                platform: this.name,
                success: false,
                error: error.response?.data?.meta?.msg || error.message,
            };
        }
    }
}
