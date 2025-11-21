import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class ThreadsAdapter implements Adapter {
  name = "threads";
  enabled = true;

  async validate(): Promise<boolean> {
    if (!process.env.THREADS_ACCESS_TOKEN || !process.env.THREADS_USER_ID) {
      logger.warn("THREADS_ACCESS_TOKEN or THREADS_USER_ID is missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      if (!post.publishedUrl) {
        logger.warn("No publishedUrl available for Threads posting. Skipping.");
        return {
          platform: this.name,
          success: false,
          error: "No Blogger URL available to share",
        };
      }

      const { message } = formatSocialPost(post, 500); // Threads has 500 char limit

      // Step 1: Create media container
      const containerResponse = await axios.post(
        `https://graph.threads.net/v1.0/${process.env.THREADS_USER_ID}/threads`,
        {
          media_type: "TEXT",
          text: message,
          link_attachment: post.publishedUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.THREADS_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      const creationId = containerResponse.data.id;

      // Step 2: Publish the container
      const publishResponse = await axios.post(
        `https://graph.threads.net/v1.0/${process.env.THREADS_USER_ID}/threads_publish`,
        {
          creation_id: creationId,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.THREADS_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      const threadId = publishResponse.data.id;

      return {
        platform: this.name,
        success: true,
        url: `https://www.threads.net/t/${threadId}`,
        postId: threadId,
      };
    } catch (error: any) {
      return {
        platform: this.name,
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }
}
