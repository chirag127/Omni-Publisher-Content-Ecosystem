import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class DiscordAdapter implements Adapter {
  name = "discord";
  enabled = true;

  async validate(): Promise<boolean> {
    if (!process.env.DISCORD_WEBHOOK_URL) {
      logger.warn("DISCORD_WEBHOOK_URL is missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      if (!post.publishedUrl) {
        logger.warn("No publishedUrl available for Discord posting. Skipping.");
        return {
          platform: this.name,
          success: false,
          error: "No Blogger URL available to share",
        };
      }

      // Discord webhook limit is 2000 chars
      const { message } = formatSocialPost(post, 2000);

      await axios.post(process.env.DISCORD_WEBHOOK_URL!, {
        content: message,
      });

      return {
        platform: this.name,
        success: true,
        url: "", // Webhooks don't return a URL
        postId: "",
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
