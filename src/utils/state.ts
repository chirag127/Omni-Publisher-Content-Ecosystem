import fs from "fs/promises";
import type { PostMap, PostState } from "../types.js";
import { logger } from "./logger.js";

const STATE_FILE = ".postmap.json";

export async function loadState(): Promise<PostMap> {
  try {
    const content = await fs.readFile(STATE_FILE, "utf-8");
    const rawState = JSON.parse(content);

    // Migration logic: Convert string URLs to PostState objects
    for (const slug in rawState) {
      for (const platform in rawState[slug]) {
        if (typeof rawState[slug][platform] === "string") {
          rawState[slug][platform] = {
            url: rawState[slug][platform],
            lastUpdated: new Date().toISOString(),
          } as PostState;
        }
      }
    }
    return rawState;
  } catch (error) {
    return {};
  }
}

export async function saveState(state: PostMap): Promise<void> {
  try {
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    logger.error("Failed to save state", { error });
  }
}

export function updatePostState(
  state: PostMap,
  slug: string,
  platform: string,
  url: string,
  postId?: string,
  contentHash?: string,
): void {
  if (!state[slug]) {
    state[slug] = {};
  }

  const currentState = state[slug][platform] || {};

  state[slug][platform] = {
    url,
    postId: postId || (currentState as PostState).postId,
    contentHash: contentHash || (currentState as PostState).contentHash,
    lastUpdated: new Date().toISOString(),
  };
}

export function isPublished(state: PostMap, slug: string, platform: string): boolean {
  return !!(state[slug] && state[slug][platform]);
}

export function getPostState(
  state: PostMap,
  slug: string,
  platform: string,
): PostState | undefined {
  return state[slug]?.[platform];
}
