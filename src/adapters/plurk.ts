import crypto from "crypto";
import axios from "axios";
import OAuth from "oauth-1.0a";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class PlurkAdapter implements Adapter {
    name = "plurk";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.PLURK_CONSUMER_KEY ||
            !process.env.PLURK_CONSUMER_SECRET ||
            !process.env.PLURK_TOKEN ||
            !process.env.PLURK_TOKEN_SECRET
        ) {
            logger.warn("PLURK credentials are missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            // Plurk limit ~360 chars. Using 300 to be safe.
            const { message } = formatSocialPost(post, 300);

            const oauth = new OAuth({
                consumer: {
                    key: process.env.PLURK_CONSUMER_KEY!,
                    secret: process.env.PLURK_CONSUMER_SECRET!,
                },
                signature_method: "HMAC-SHA1",
                hash_function(base_string: string, key: string) {
                    return crypto
                        .createHmac("sha1", key)
                        .update(base_string)
                        .digest("base64");
                },
            });

            const request_data = {
                url: "https://www.plurk.com/APP/Timeline/plurkAdd",
                method: "POST",
            };

            const token = {
                key: process.env.PLURK_TOKEN!,
                secret: process.env.PLURK_TOKEN_SECRET!,
            };

            // Plurk requires params to be signed if they are in the body?
            // OAuth 1.0a spec says body params should be signed if form-urlencoded.
            // Let's include them in the signature.
            const data = {
                content: message,
                qualifier: "shares", // "shares" is a good qualifier for links
                lang: "en",
            };

            const authHeader = oauth.toHeader(
                oauth.authorize({ ...request_data, data }, token)
            );

            const params = new URLSearchParams(data);

            const response = await axios.post(request_data.url, params, {
                headers: {
                    ...authHeader,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const plurkId = response.data.plurk_id;
            // Convert ID to base36 for URL
            const base36Id = plurkId.toString(36);
            const postUrl = `https://www.plurk.com/p/${base36Id}`;

            return {
                platform: this.name,
                success: true,
                url: postUrl,
                postId: String(plurkId),
            };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return {
                    platform: this.name,
                    success: false,
                    error: error.response?.data?.error_text || error.message,
                };
            }
            return {
                platform: this.name,
                success: false,
                error: error.message,
            };
        }
    }
}
