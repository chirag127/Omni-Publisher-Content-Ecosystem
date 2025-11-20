import { Client } from "@notionhq/client";
import { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class NotionAdapter implements Adapter {
    name = "notion";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
            logger.warn("NOTION_TOKEN or NOTION_DATABASE_ID is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const notion = new Client({ auth: process.env.NOTION_TOKEN });

            // Notion requires blocks. We need to convert markdown to blocks.
            // For simplicity, we'll create a single paragraph block with the content.
            // A proper implementation would use a markdown-to-notion parser.
            // We'll split by paragraphs.

            const children = post.content.split("\n\n").map((para) => ({
                object: "block",
                type: "paragraph",
                paragraph: {
                    rich_text: [
                        {
                            type: "text",
                            text: {
                                content: para.substring(0, 2000), // Notion block limit
                            },
                        },
                    ],
                },
            }));

            const response = await notion.pages.create({
                parent: { database_id: process.env.NOTION_DATABASE_ID! },
                properties: {
                    Name: {
                        title: [
                            {
                                text: {
                                    content: post.title,
                                },
                            },
                        ],
                    },
                    Tags: {
                        multi_select:
                            post.tags?.map((tag) => ({ name: tag })) || [],
                    },
                },
                children: children as any,
            });

            return {
                platform: this.name,
                success: true,
                url: (response as any).url,
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
