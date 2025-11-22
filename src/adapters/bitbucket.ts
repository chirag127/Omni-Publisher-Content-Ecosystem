import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class BitbucketAdapter implements Adapter {
    name = "bitbucket";
    enabled = true;

    async validate(): Promise<boolean> {
        if (
            !process.env.BITBUCKET_USERNAME ||
            !process.env.BITBUCKET_APP_PASSWORD ||
            !process.env.BITBUCKET_WORKSPACE ||
            !process.env.BITBUCKET_REPO_SLUG
        ) {
            logger.warn("BITBUCKET credentials are missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const workspace = process.env.BITBUCKET_WORKSPACE!;
            const repoSlug = process.env.BITBUCKET_REPO_SLUG!;
            const branch = process.env.BITBUCKET_BRANCH || "main"; // or master
            const filePath = `content/posts/${post.slug}.md`;

            // Bitbucket API requires x-www-form-urlencoded for creating files
            // Key is the file path, Value is the content
            const params = new URLSearchParams();
            params.append(filePath, post.content);
            params.append("message", `Publish: ${post.title}`);
            params.append("branch", branch);

            const auth = Buffer.from(
                `${process.env.BITBUCKET_USERNAME}:${process.env.BITBUCKET_APP_PASSWORD}`
            ).toString("base64");

            await axios.post(
                `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}/src`,
                params,
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            const postUrl = `https://bitbucket.org/${workspace}/${repoSlug}/src/${branch}/${filePath}`;

            return {
                platform: this.name,
                success: true,
                url: postUrl,
                postId: filePath,
            };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return {
                    platform: this.name,
                    success: false,
                    error:
                        error.response?.data?.error?.message || error.message,
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
