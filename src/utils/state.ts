import fs from "fs/promises";
import path from "path";
import { PostMap } from "../types.js";
import { logger } from "./logger.js";

const STATE_FILE = ".postmap.json";

export async function loadState(): Promise<PostMap> {
    try {
        const content = await fs.readFile(STATE_FILE, "utf-8");
        return JSON.parse(content);
    } catch (error) {
        // If file doesn't exist, return empty state
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

export async function updatePostState(
    slug: string,
    platform: string,
    url: string
): Promise<void> {
    const state = await loadState();
    if (!state[slug]) {
        state[slug] = {};
    }
    state[slug][platform] = url;
    await saveState(state);
}

export async function isPublished(
    slug: string,
    platform: string
): Promise<boolean> {
    const state = await loadState();
    return !!(state[slug] && state[slug][platform]);
}
