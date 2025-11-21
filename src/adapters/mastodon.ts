import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class MastodonAdapter implements Adapter {
  name = "mastodon";
  enabled = true;

  async validate(): Promise<boolean> {
    if (!process.env.MASTODON_TOKEN || !process.env.MASTODON_INSTANCE_URL) {
      logger.warn("MASTODON_TOKEN or MASTODON_INSTANCE_URL is missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      if (!post.publishedUrl) {
        logger.warn("No publishedUrl available for Mastodon posting. Skipping.");
        return {
          platform: this.name,
          success: false,
          error: "No Blogger URL available to share",
        };
      }

      // Mastodon has 500 character limit
      const { message } = formatSocialPost(post, 500);

      const response = await axios.post(
        `${process.env.MASTODON_INSTANCE_URL}/api/v1/statuses`,
        {
          status: message,
          visibility: "public",
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.MASTODON_TOKEN}`,
            "Content-Type": "application/json",
          },
        },
      );

      return {
        platform: this.name,
        success: true,
        url: response.data.url,
        postId: response.data.id,
      };
    } catch (error: any) {
      return {
        platform: this.name,
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }
}
