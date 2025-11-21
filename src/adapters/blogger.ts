import { google } from "googleapis";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { markdownToHtml } from "../utils/markdown.js";

export class BloggerAdapter implements Adapter {
  name = "blogger";
  enabled = true;

  async validate(): Promise<boolean> {
    if (
      !process.env.BLOGGER_CLIENT_ID ||
      !process.env.BLOGGER_CLIENT_SECRET ||
      !process.env.BLOGGER_REFRESH_TOKEN ||
      !process.env.BLOGGER_BLOG_ID
    ) {
      logger.warn(
        "BLOGGER_CLIENT_ID, BLOGGER_CLIENT_SECRET, BLOGGER_REFRESH_TOKEN, or BLOGGER_BLOG_ID is missing",
      );
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.BLOGGER_CLIENT_ID,
        process.env.BLOGGER_CLIENT_SECRET,
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.BLOGGER_REFRESH_TOKEN,
      });

      const blogger = google.blogger({
        version: "v3",
        auth: oauth2Client,
      });

      // Add a delay to avoid rate limits (5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const response = await blogger.posts.insert({
        blogId: process.env.BLOGGER_BLOG_ID,
        requestBody: {
          title: post.title,
          content: markdownToHtml(post.content),
          labels: post.tags,
        },
      });

      return {
        platform: this.name,
        success: true,
        url: response.data.url || "",
        postId: response.data.id || "",
      };
    } catch (error: any) {
      return {
        platform: this.name,
        success: false,
        error: error.message || JSON.stringify(error),
      };
    }
  }

  async update(post: Post, postId: string): Promise<PublishResult> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.BLOGGER_CLIENT_ID,
        process.env.BLOGGER_CLIENT_SECRET,
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.BLOGGER_REFRESH_TOKEN,
      });

      const blogger = google.blogger({
        version: "v3",
        auth: oauth2Client,
      });

      // Add a delay to avoid rate limits (5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const response = await blogger.posts.update({
        blogId: process.env.BLOGGER_BLOG_ID,
        postId: postId,
        requestBody: {
          title: post.title,
          content: markdownToHtml(post.content),
          labels: post.tags,
        },
      });

      return {
        platform: this.name,
        success: true,
        url: response.data.url || "",
        postId: response.data.id || "",
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
