import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { markdownToTelegraph } from "../utils/telegraph-converter.js";

export class TelegraphAdapter implements Adapter {
  name = "telegraph";
  enabled = true;

  async validate(): Promise<boolean> {
    if (!process.env.TELEGRAPH_ACCESS_TOKEN) {
      logger.warn("TELEGRAPH_ACCESS_TOKEN is missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      // Telegraph expects an array of Node objects.
      // We can use a simple conversion or just send text.
      // For better quality, we should convert markdown to Telegraph nodes.
      // But for now, we'll send it as a single paragraph of text (or HTML string if supported? No, it needs nodes).
      // We'll do a basic split by newlines to create paragraphs.

      // Convert Markdown to Telegraph Nodes
      const contentNodes = markdownToTelegraph(post.content);

      // Retry logic for ECONNRESET
      let retries = 3;
      let response: any;
      while (retries > 0) {
        try {
          response = await axios.post("https://api.telegra.ph/createPage", {
            access_token: process.env.TELEGRAPH_ACCESS_TOKEN,
            title: post.title,
            content: JSON.stringify(contentNodes),
            return_content: true,
          });
          break; // Success
        } catch (err: any) {
          retries--;
          if (retries === 0) throw err;
          logger.warn(`Telegraph publish failed, retrying... (${retries} attempts left)`, {
            error: err.message,
          });
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
        }
      }

      if (!response || !response.data.ok) {
        throw new Error(response?.data?.error || "Unknown Telegraph error");
      }

      return {
        platform: this.name,
        success: true,
        url: response.data.result.url,
        postId: response.data.result.path,
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
