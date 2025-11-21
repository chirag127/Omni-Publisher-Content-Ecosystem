import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class HashnodeAdapter implements Adapter {
  name = "hashnode";
  enabled = true;

  async validate(): Promise<boolean> {
    if (!process.env.HASHNODE_TOKEN || !process.env.HASHNODE_PUBLICATION_ID) {
      logger.warn("HASHNODE_TOKEN or HASHNODE_PUBLICATION_ID is missing");
      return false;
    }
    return true;
  }

  async publish(post: Post): Promise<PublishResult> {
    const query = `
      mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) {
          post {
            url
            id
          }
        }
      }
    `;

    const variables = {
      input: {
        title: post.title,
        contentMarkdown: post.content,
        tags: post.tags?.map((tag) => ({
          name: tag,
          slug: tag
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-") // Replace spaces and special chars with hyphens
            .replace(/^-+|-+$/g, ""), // Remove leading/trailing hyphens
        })),
        publicationId: process.env.HASHNODE_PUBLICATION_ID,
      },
    };

    try {
      const response = await axios.post(
        "https://gql.hashnode.com",
        { query, variables },
        {
          headers: {
            Authorization: process.env.HASHNODE_TOKEN,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return {
        platform: this.name,
        success: true,
        url: response.data.data.publishPost.post.url,
        postId: response.data.data.publishPost.post.id,
      };
    } catch (error: any) {
      return {
        platform: this.name,
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message,
      };
    }
  }

  async update(post: Post, postId: string): Promise<PublishResult> {
    const query = `
      mutation UpdatePost($input: UpdatePostInput!) {
        updatePost(input: $input) {
          post {
            url
            id
          }
        }
      }
    `;

    const variables = {
      input: {
        id: postId,
        title: post.title,
        contentMarkdown: post.content,
        tags: post.tags?.map((tag) => ({
          name: tag,
          slug: tag
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, ""),
        })),
      },
    };

    try {
      const response = await axios.post(
        "https://gql.hashnode.com",
        { query, variables },
        {
          headers: {
            Authorization: process.env.HASHNODE_TOKEN,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return {
        platform: this.name,
        success: true,
        url: response.data.data.updatePost.post.url,
        postId: response.data.data.updatePost.post.id,
      };
    } catch (error: any) {
      return {
        platform: this.name,
        success: false,
        error: error.response?.data?.errors?.[0]?.message || error.message,
      };
    }
  }
}
