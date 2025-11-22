import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class WriteAsAdapter implements Adapter {
    name = "writeas";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.WRITEAS_ACCESS_TOKEN) {
            logger.warn("WRITEAS_ACCESS_TOKEN is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const response = await axios.post(
                "https://write.as/api/posts",
                {
                    body: post.content,
                    title: post.title,
                    font: "sans",
                    lang: "en",
                },
                {
                    headers: {
                        Authorization: `Token ${process.env.WRITEAS_ACCESS_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = response.data.data;
            const postUrl = `https://write.as/${data.id}`;

            return {
                platform: this.name,
                success: true,
                url: postUrl,
                postId: data.id,
            };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return {
                    platform: this.name,
                    success: false,
                    error: error.response?.data?.error_msg || error.message,
                };
            }
            return {
                platform: this.name,
                success: false,
                error: error.message,
            };
        }
    }
}
