import axios from "axios";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class LinkedInAdapter implements Adapter {
    name = "linkedin";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.LINKEDIN_ACCESS_TOKEN ||
            !process.env.LINKEDIN_PERSON_URN
        ) {
            logger.warn(
                "LINKEDIN_ACCESS_TOKEN or LINKEDIN_PERSON_URN is missing"
            );
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const response = await axios.post(
                "https://api.linkedin.com/v2/ugcPosts",
                {
                    author: `urn:li:person:${process.env.LINKEDIN_PERSON_URN}`,
                    lifecycleState: "PUBLISHED",
                    specificContent: {
                        "com.linkedin.ugc.ShareContent": {
                            shareCommentary: {
                                text: `${post.title}\n\n${
                                    post.description || ""
                                }\n\n${
                                    post.tags?.map((t) => `#${t}`).join(" ") ||
                                    ""
                                }`,
                            },
                            shareMediaCategory: "NONE", // Or ARTICLE if we have a URL
                        },
                    },
                    visibility: {
                        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                        "X-Restli-Protocol-Version": "2.0.0",
                    },
                }
            );

            return {
                platform: this.name,
                success: true,
                url: `https://www.linkedin.com/feed/update/${response.data.id}`,
                postId: response.data.id,
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
