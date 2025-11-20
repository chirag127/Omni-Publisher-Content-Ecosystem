import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class MastodonAdapter implements Adapter {
    name = "mastodon";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.MASTODON_ACCESS_TOKEN ||
            !process.env.MASTODON_INSTANCE_URL
        ) {
            logger.warn(
                "MASTODON_ACCESS_TOKEN or MASTODON_INSTANCE_URL is missing"
            );
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.MASTODON_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                platform: this.name,
                success: true,
                url: response.data.url,
                postId: response.data.id,
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
