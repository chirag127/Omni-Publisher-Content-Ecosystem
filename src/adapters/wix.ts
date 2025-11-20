import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class WixAdapter implements Adapter {
    name = "wix";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.WIX_API_KEY ||
            !process.env.WIX_SITE_ID ||
            !process.env.WIX_MEMBER_ID
        ) {
            logger.warn(
                "WIX_API_KEY, WIX_SITE_ID, or WIX_MEMBER_ID is missing"
            );
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const response = await axios.post(
                "https://www.wixapis.com/blog/v3/draft-posts",
                {
                    draftPost: {
                        title: post.title,
                        memberId: process.env.WIX_MEMBER_ID,
                        richContent: {
                            nodes: [
                                {
                                    type: "PARAGRAPH",
                                    id: "",
                                    nodes: [
                                        {
                                            type: "TEXT",
                                            id: "",
                                            nodes: [],
                                            textData: {
                                                text: post.content, // Wix Rich Content is complex. Sending raw text for now or HTML if supported.
                                                // The API expects a specific structure.
                                                // For simplicity in this strict environment, we might need a better converter or just send plain text.
                                                // Let's try to send it as HTML if possible, but the docs say 'richContent'.
                                                // Fallback: Send as a single text node.
                                                decorations: [],
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    headers: {
                        Authorization: process.env.WIX_API_KEY,
                        "wix-site-id": process.env.WIX_SITE_ID,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                platform: this.name,
                success: true,
                url: "", // Drafts don't have public URLs immediately
                postId: response.data.draftPost.id,
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
