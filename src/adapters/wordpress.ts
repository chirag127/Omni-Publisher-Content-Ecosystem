import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { markdownToHtml } from "../utils/markdown.js";

export class WordPressAdapter implements Adapter {
  name = "wordpress";
  enabled = true;

  async validate(): Promise<boolean> {
    if (!process.env.WORDPRESS_TOKEN || !process.env.WORDPRESS_SITE_ID) {
      logger.warn("WORDPRESS_TOKEN or WORDPRESS_SITE_ID is missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      // WordPress.com API endpoint
      const response = await axios.post(
        `https://public-api.wordpress.com/rest/v1.1/sites/${process.env.WORDPRESS_SITE_ID}/posts/new`,
        {
          title: post.title,
          content: markdownToHtml(post.content),
          status: "publish",
          tags: post.tags?.join(","),
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WORDPRESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      return {
        platform: this.name,
        success: true,
        url: response.data.URL,
        postId: response.data.ID.toString(),
      };
    } catch (error: any) {
      return {
        platform: this.name,
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async update(post: Post, postId: string): Promise<PublishResult> {
    try {
      const response = await axios.post(
        `https://public-api.wordpress.com/rest/v1.1/sites/${process.env.WORDPRESS_SITE_ID}/posts/${postId}`,
        {
          title: post.title,
          content: markdownToHtml(post.content),
          status: "publish",
          tags: post.tags?.join(","),
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WORDPRESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      return {
        platform: this.name,
        success: true,
        url: response.data.URL,
        postId: response.data.ID.toString(),
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
