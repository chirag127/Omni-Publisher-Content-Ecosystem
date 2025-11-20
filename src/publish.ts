import dotenv from "dotenv";
// Load environment variables BEFORE any other imports that might use them
dotenv.config();

import fs from "fs/promises";
import path from "path";
import { Post, Adapter, PublishResult } from "./types.js";
import {
    logger,
    logPublishSuccess,
    logPublishFailure,
} from "./utils/logger.js";
import { parseMarkdown } from "./utils/markdown.js";
import {
    loadState,
    saveState,
    isPublished,
    updatePostState,
} from "./utils/state.js";

// Import Adapters
import { DevToAdapter } from "./adapters/devto.js";
import { HashnodeAdapter } from "./adapters/hashnode.js";
import { MediumAdapter } from "./adapters/medium.js";
import { WordPressAdapter } from "./adapters/wordpress.js";
import { BloggerAdapter } from "./adapters/blogger.js";
import { TumblrAdapter } from "./adapters/tumblr.js";
import { WixAdapter } from "./adapters/wix.js";
import { TelegraphAdapter } from "./adapters/telegraph.js";
import { MastodonAdapter } from "./adapters/mastodon.js";
import { NotionAdapter } from "./adapters/notion.js";
import { StrapiAdapter } from "./adapters/strapi.js";
import { LinkedInAdapter } from "./adapters/linkedin.js";
import { RedditAdapter } from "./adapters/reddit.js";
import { DiscordAdapter } from "./adapters/discord.js";
import { ShowwcaseAdapter } from "./adapters/showwcase.js";

const ADAPTERS: Adapter[] = [
    new DevToAdapter(),
    new HashnodeAdapter(),
    new MediumAdapter(),
    new WordPressAdapter(),
    new BloggerAdapter(),
    new TumblrAdapter(),
    new WixAdapter(),
    new TelegraphAdapter(),
    new MastodonAdapter(),
    new NotionAdapter(),
    new StrapiAdapter(),
    new LinkedInAdapter(),
    new RedditAdapter(),
    new DiscordAdapter(),
    new ShowwcaseAdapter(),
];

async function getPosts(postsDir: string): Promise<Post[]> {
    const files = await fs.readdir(postsDir);
    const posts: Post[] = [];

    for (const file of files) {
        if (file.endsWith(".md")) {
            const content = await fs.readFile(
                path.join(postsDir, file),
                "utf-8"
            );
            const post = parseMarkdown(content);
            // Ensure slug is present, default to filename without extension
            if (!post.slug) {
                post.slug = file.replace(".md", "");
            }
            posts.push(post);
        }
    }
    return posts;
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes("--dry-run");
    const force = args.includes("--force"); // Re-publish even if already published

    logger.info("Starting Omni-Publisher...", { dryRun, force });

    const postsDir = path.join(process.cwd(), "content", "posts");
    const posts = await getPosts(postsDir);
    const state = await loadState();

    // Filter enabled adapters
    const enabledAdapters: Adapter[] = [];
    for (const adapter of ADAPTERS) {
        if (adapter.enabled && (await adapter.validate())) {
            enabledAdapters.push(adapter);
        } else {
            logger.warn(
                `Adapter ${adapter.name} is disabled or invalid configuration`
            );
        }
    }

    if (enabledAdapters.length === 0) {
        logger.error("No enabled adapters found. Exiting.");
        return;
    }

    logger.info(
        `Found ${posts.length} posts and ${enabledAdapters.length} enabled adapters.`
    );

    for (const post of posts) {
        if (!post.slug) continue; // Should be handled in getPosts but safety check

        logger.info(`Processing post: ${post.title} (${post.slug})`);

        const publishPromises = enabledAdapters.map(async (adapter) => {
            // Check if already published
            if (!force && isPublished(state, post.slug!, adapter.name)) {
                logger.info(
                    `Skipping ${post.slug} on ${adapter.name} (already published)`
                );
                return {
                    platform: adapter.name,
                    success: true,
                    skipped: true,
                } as PublishResult;
            }

            if (dryRun) {
                logger.info(
                    `[Dry Run] Would publish ${post.slug} to ${adapter.name}`
                );
                return {
                    platform: adapter.name,
                    success: true,
                    dryRun: true,
                } as PublishResult;
            }

            // Publish
            try {
                const result = await adapter.publish(post);
                if (result.success) {
                    logPublishSuccess(
                        adapter.name,
                        post.slug!,
                        result.url || ""
                    );
                    updatePostState(
                        state,
                        post.slug!,
                        adapter.name,
                        result.url || "",
                        result.postId
                    );
                } else {
                    logPublishFailure(adapter.name, post.slug!, result.error);
                }
                return result;
            } catch (error: any) {
                logPublishFailure(adapter.name, post.slug!, error);
                return {
                    platform: adapter.name,
                    success: false,
                    error: error.message,
                };
            }
        });

        await Promise.allSettled(publishPromises);

        // Save state after each post to avoid data loss on crash
        if (!dryRun) {
            await saveState(state);
        }
    }

    logger.info("Publishing complete.");
}

main().catch((error) => {
    logger.error("Fatal error in main loop", { error });
    process.exit(1);
});
