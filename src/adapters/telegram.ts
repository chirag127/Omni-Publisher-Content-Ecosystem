import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class TelegramAdapter implements Adapter {
  name = "telegram";
  enabled = true;

  async validate(): Promise<boolean> {
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
      logger.warn("TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID is missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      if (!post.publishedUrl) {
        logger.warn("No publishedUrl available for Telegram posting. Skipping.");
        return {
          platform: this.name,
          success: false,
          error: "No Blogger URL available to share",
        };
      }

      const { message } = formatSocialPost(post, 4096); // Telegram max message length

      const response = await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.TELEGRAM_CHANNEL_ID,
          text: message,
          parse_mode: "Markdown",
          disable_web_page_preview: false, // Show link preview
        },
      );

      return {
        platform: this.name,
        success: true,
        url: `https://t.me/${process.env.TELEGRAM_CHANNEL_ID?.replace("@", "")}`,
        postId: response.data.result.message_id.toString(),
      };
    } catch (error: any) {
      return {
        platform: this.name,
        success: false,
        error: error.response?.data?.description || error.message,
      };
    }
  }
}
