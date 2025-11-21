import matter from "gray-matter";
import { marked } from "marked";
import type { Post } from "../types.js";

export function parseMarkdown(content: string): Post {
  const { data, content: markdownContent } = matter(content);

  return {
    title: data.title || "Untitled",
    slug: data.slug, // Caller handles default if missing
    content: markdownContent,
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

export function extractExcerpt(markdown: string, length = 160): string {
  const text = markdown.replace(/[#*`\[\]]/g, "").replace(/\n/g, " ");
  return text.length > length ? text.substring(0, length) + "..." : text;
}
