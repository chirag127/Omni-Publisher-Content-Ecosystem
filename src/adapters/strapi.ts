    async validate(): Promise<boolean> {
        if (!process.env.STRAPI_URL || !process.env.STRAPI_TOKEN) {
            logger.warn("STRAPI_URL or STRAPI_TOKEN is missing");
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const response = await axios.post(
                `${process.env.STRAPI_URL}/api/articles`,
                {
                    data: {
                        title: post.title,
                        content: post.content, // Strapi often uses markdown or rich text
                        slug: post.slug,
                        publishedAt: new Date().toISOString(),
                        tags: post.tags, // Assuming a tags relation or field exists
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                platform: this.name,
                success: true,
                url: `${process.env.STRAPI_URL}/articles/${response.data.data.attributes.slug}`,
                postId: response.data.data.id.toString(),
            };
        } catch (error: any) {
            return {
                platform: this.name,
                success: false,
                error: error.response?.data?.error?.message || error.message,
            };
        }
    }
}
