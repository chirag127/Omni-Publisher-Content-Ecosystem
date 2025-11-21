import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class ShowwcaseAdapter implements Adapter {
  name = "showwcase";
  enabled = true;

  async validate(): Promise<boolean> {
    // Showwcase API details are scarce.
    // We'll disable it by default or warn.
    logger.warn("Showwcase adapter is not fully implemented due to missing API docs");
    return false;
  }

  async publish(_post: Post): Promise<PublishResult> {
    return {
      platform: this.name,
      success: false,
      error: "Showwcase adapter not implemented",
    };
  }
}
