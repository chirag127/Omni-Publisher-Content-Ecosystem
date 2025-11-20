import fs from "fs/promises";
import path from "path";
import { logger } from "./utils/logger.js";

const SEED_POSTS_FILE = path.join(
    process.cwd(),
    "src",
    "data",
    "seed_posts.json"
);
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

interface SeedPost {
    title: string;
    slug: string;
    description: string;
    tags: string[];
    content: string; // Or we generate it
}

async function generateSeedContent() {
    try {
        await fs.mkdir(POSTS_DIR, { recursive: true });

        // Check if seed file exists
        try {
            await fs.access(SEED_POSTS_FILE);
        } catch {
            logger.warn("Seed posts file not found. Creating dummy seed data.");
            const dummyPosts: SeedPost[] = Array.from({ length: 5 }).map(
                (_, i) => ({
                    title: `Omni-Publisher Demo Post ${i + 1}`,
                    slug: `omni-publisher-demo-${i + 1}`,
                    description: `This is a demo post ${
                        i + 1
                    } for Omni-Publisher.`,
                    tags: ["demo", "omni-publisher", "testing"],
                    content: `# Omni-Publisher Demo Post ${
                        i + 1
                    }\n\nThis is the content of the demo post. It is generated automatically.\n\n## Section 1\n\nSome content here.\n\n## Section 2\n\nMore content here.`,
                })
            );
            await fs.mkdir(path.dirname(SEED_POSTS_FILE), { recursive: true });
            await fs.writeFile(
                SEED_POSTS_FILE,
                JSON.stringify(dummyPosts, null, 2)
            );
        }

        const data = await fs.readFile(SEED_POSTS_FILE, "utf-8");
        const posts: SeedPost[] = JSON.parse(data);

        for (const post of posts) {
            const filePath = path.join(POSTS_DIR, `${post.slug}.md`);
            const fileContent = `---
title: "${post.title}"
description: "${post.description}"
tags: [${post.tags.map((t) => `"${t}"`).join(", ")}]
slug: "${post.slug}"
---

${post.content}
`;
            await fs.writeFile(filePath, fileContent);
            logger.info(`Generated post: ${filePath}`);
        }

        logger.info(`Successfully generated ${posts.length} posts.`);
    } catch (error) {
        logger.error("Error generating seed content", { error });
    }
}

generateSeedContent();
