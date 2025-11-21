import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class LinkedInAdapter implements Adapter {
  name = "linkedin";
  enabled = true;

  async validate(): Promise<boolean> {
    if (!process.env.LINKEDIN_ACCESS_TOKEN) {
      logger.warn("LINKEDIN_ACCESS_TOKEN is missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      if (!post.publishedUrl) {
        logger.warn("No publishedUrl available for LinkedIn posting. Skipping.");
        return {
          platform: this.name,
          success: false,
          error: "No Blogger URL available to share",
        };
      }

      // LinkedIn has generous character limit
      const { message } = formatSocialPost(post, 3000);

      // Using Posts API v2
      const response = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        {
          author: "urn:li:person:" + process.env.LINKEDIN_PERSON_URN,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: message,
              },
              shareMediaCategory: "ARTICLE",
              media: [
                {
                  status: "READY",
                  originalUrl: post.publishedUrl,
                },
              ],
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.LINKEDIN_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
        },
      );

      return {
        platform: this.name,
        success: true,
        url: `https://www.linkedin.com/feed/update/${response.data.id}`,
        postId: response.data.id,
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
