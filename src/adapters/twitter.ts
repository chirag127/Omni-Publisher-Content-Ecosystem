import crypto from "crypto";
import axios from "axios";
import OAuth from "oauth-1.0a";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class TwitterAdapter implements Adapter {
  name = "twitter";
  enabled = true;

  async validate(): Promise<boolean> {
    if (
      !process.env.TWITTER_API_KEY ||
      !process.env.TWITTER_API_SECRET ||
      !process.env.TWITTER_ACCESS_TOKEN ||
      !process.env.TWITTER_ACCESS_TOKEN_SECRET
    ) {
      logger.warn("TWITTER credentials are missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      if (!post.publishedUrl) {
        logger.warn("No publishedUrl available for Twitter posting. Skipping.");
        return {
          platform: this.name,
          success: false,
          error: "No Blogger URL available to share",
        };
      }

      const { message } = formatSocialPost(post, 280); // Twitter has 280 char limit

      // Use oauth-1.0a library for robust signature generation
      const oauth = new OAuth({
        consumer: {
          key: process.env.TWITTER_API_KEY!,
          secret: process.env.TWITTER_API_SECRET!,
        },
        signature_method: "HMAC-SHA1",
        hash_function(base_string: string, key: string) {
          return crypto.createHmac("sha1", key).update(base_string).digest("base64");
        },
      });

      const request_data = {
        url: "https://api.twitter.com/2/tweets",
        method: "POST",
      };

      // Note: Twitter API v2 POST body is NOT part of the OAuth 1.0a signature
      // Only query params would be. Since we send JSON body, we sign only the URL/Method.

      const token = {
        key: process.env.TWITTER_ACCESS_TOKEN!,
        secret: process.env.TWITTER_ACCESS_TOKEN_SECRET!,
      };

      const authHeader = oauth.toHeader(oauth.authorize(request_data, token));

      const response = await axios.post(
        request_data.url,
        {
          text: message,
        },
        {
          headers: {
            ...authHeader,
            "Content-Type": "application/json",
          },
        },
      );

      const tweetId = response.data.data.id;
      const tweetUrl = `https://twitter.com/i/web/status/${tweetId}`;

      return {
        platform: this.name,
        success: true,
        url: tweetUrl,
        postId: tweetId,
      };
    } catch (error: any) {
      let errorMessage =
        error.response?.data?.detail || error.response?.data?.title || error.message;

      if (error.response?.status === 403) {
        errorMessage +=
          " (Hint: Check App Permissions in Twitter Developer Portal. Must be 'Read and Write'.)";
      }

      return {
        platform: this.name,
        success: false,
        error: errorMessage,
      };
    }
  }
}
