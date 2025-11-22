import axios from "axios";
import type { Adapter, Post, PublishResult } from "../types.js";
import { logger } from "../utils/logger.js";

export class GitLabAdapter implements Adapter {
    name = "gitlab";
    enabled = true;

    async validate(): Promise<boolean> {
        if (!process.env.GITLAB_TOKEN || !process.env.GITLAB_PROJECT_ID) {
            logger.warn("GITLAB_TOKEN or GITLAB_PROJECT_ID is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const projectId = encodeURIComponent(
                process.env.GITLAB_PROJECT_ID!
            );
            const branch = process.env.GITLAB_BRANCH || "main";
            const filePath = `content/posts/${post.slug}.md`;
            const encodedPath = encodeURIComponent(filePath);

            const requestBody = {
                branch: branch,
                content: post.content,
                commit_message: `Publish: ${post.title}`,
            };

            const response = await axios.post(
                `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodedPath}`,
                requestBody,
                {
                    headers: {
                        "PRIVATE-TOKEN": process.env.GITLAB_TOKEN,
                        "Content-Type": "application/json",
                    },
                }
            );

            const projectPath = response.data.file_path || filePath;
            // Construct URL to the file in the repo (or Pages URL if known, but repo URL is safer)
            // We don't know the project path (user/repo) easily without another API call,
            // but we can guess or just return the file path.
            // Let's try to get project info if possible, or just use a generic URL.
            // Actually, for "publishedUrl", the user might want the GitLab Pages URL.
            // But we are "posting" to the repo.
            // Let's return the repository file URL.
            // We can't construct the full URL without the namespace/project-slug.
            // We'll use a placeholder or just the file path if we can't get it.
            // Wait, we can fetch project info to get the web_url.

            // Let's do a quick fetch of project info to get the web URL base
            let webUrlBase = "https://gitlab.com";
            try {
                const projectInfo = await axios.get(
                    `https://gitlab.com/api/v4/projects/${projectId}`,
                    { headers: { "PRIVATE-TOKEN": process.env.GITLAB_TOKEN } }
                );
                webUrlBase = projectInfo.data.web_url;
            } catch (e) {
                // Ignore error, fallback
            }

            const postUrl = `${webUrlBase}/-/blob/${branch}/${filePath}`;

            return {
                platform: this.name,
                success: true,
                url: postUrl,
                postId: filePath,
            };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return {
                    platform: this.name,
                    success: false,
                    error: error.response?.data?.message || error.message,
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
