import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";
import { formatSocialPost } from "../utils/message-template.js";

export class BlueskyAdapter implements Adapter {
  name = "bluesky";
  enabled = true;
  private accessJwt?: string;

  async validate(): Promise<boolean> {
    if (!process.env.BLUESKY_HANDLE || !process.env.BLUESKY_APP_PASSWORD) {
      logger.warn("BLUESKY_HANDLE or BLUESKY_APP_PASSWORD is missing");
      return false;
    }
    return true;
  }

  private async getSession(): Promise<string> {
    if (this.accessJwt) return this.accessJwt;

    const response = await axios.post("https://bsky.social/xrpc/com.atproto.server.createSession", {
      identifier: process.env.BLUESKY_HANDLE!,
      password: process.env.BLUESKY_APP_PASSWORD!,
    });

    this.accessJwt = response.data.accessJwt;
    return this.accessJwt!; // Always defined after successful API call
  }

  async publish(post: Post): Promise<PublishResult> {
    try {
      if (!post.publishedUrl) {
        logger.warn("No publishedUrl available for Bluesky posting. Skipping.");
        return {
          platform: this.name,
          success: false,
          error: "No Blogger URL available to share",
        };
      }

      const { message } = formatSocialPost(post, 300); // Bluesky has 300 char limit
      const accessJwt = await this.getSession();

      // Correctly calculate byte indices for facets
      const encoder = new TextEncoder();

      const urlBytes = encoder.encode(post.publishedUrl);

      // Find the byte position of the URL in the message
      // Note: This assumes the URL appears exactly once and matches byte-wise
      // A more robust way is to construct the message with known parts

      const urlIndex = message.indexOf(post.publishedUrl);

      const facets = [];

      if (urlIndex >= 0) {
        // Calculate byte offset
        const prefix = message.substring(0, urlIndex);
        const byteStart = encoder.encode(prefix).length;
        const byteEnd = byteStart + urlBytes.length;

        facets.push({
          index: {
            byteStart: byteStart,
            byteEnd: byteEnd,
          },
          features: [
            {
              $type: "app.bsky.richtext.facet#link",
              uri: post.publishedUrl,
            },
          ],
        });
      }

      const response = await axios.post(
        "https://bsky.social/xrpc/com.atproto.repo.createRecord",
        {
          repo: process.env.BLUESKY_HANDLE!,
          collection: "app.bsky.feed.post",
          record: {
            text: message,
            createdAt: new Date().toISOString(),
            $type: "app.bsky.feed.post",
            facets: facets,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessJwt}`,
            "Content-Type": "application/json",
          },
        },
      );

      const postUri = response.data.uri;
      const did = process.env.BLUESKY_HANDLE;
      const postId = postUri.split("/").pop();
      const postUrl = `https://bsky.app/profile/${did}/post/${postId}`;

      return {
        platform: this.name,
        success: true,
        url: postUrl,
        postId: postUri,
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
