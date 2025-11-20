import matter from "gray-matter";
import { marked } from "marked";
import { Post } from "../types.js";
import fs from "fs/promises";
import path from "path";

export async function parseMarkdown(filePath: string): Promise<Post> {
    const fileContent = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(fileContent);

    return {
        title: data.title || "Untitled",
        slug: data.slug || path.basename(filePath, ".md"),
        content: content,
        description: data.description,
        date: data.date,
        tags: data.tags || [],
        coverImage: data.cover_image,
        frontmatter: data,
    };
}

export function markdownToHtml(markdown: string): string {
    return marked.parse(markdown) as string;
}

export function extractExcerpt(markdown: string, length: number = 160): string {
    const text = markdown.replace(/[#*`\[\]]/g, "").replace(/\n/g, " ");
    return text.length > length ? text.substring(0, length) + "..." : text;
}
