        if (
            !process.env.WORDPRESS_URL ||
            !process.env.WORDPRESS_USERNAME ||
            !process.env.WORDPRESS_APP_PASSWORD
        ) {
            logger.warn(
                "WORDPRESS_URL, WORDPRESS_USERNAME, or WORDPRESS_APP_PASSWORD is missing"
            );
            return false;
        }
        return true;
    }

    async publish(post: Post): Promise<PublishResult> {
        try {
            const auth = Buffer.from(
                `${process.env.WORDPRESS_USERNAME}:${process.env.WORDPRESS_APP_PASSWORD}`
            ).toString("base64");

            const response = await axios.post(
                `${process.env.WORDPRESS_URL}/wp-json/wp/v2/posts`,
                {
                    title: post.title,
                    content: markdownToHtml(post.content),
                    // Better: Convert to HTML first since WP REST API expects HTML in 'content' field usually.
                    // I will import markdownToHtml from utils.
                    status: "publish",
                    tags: [], // Handling tags requires tag IDs in WP, skipping for simplicity or need to look up IDs.
                },
                {
                    headers: {
                        Authorization: `Basic ${auth}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            return {
                platform: this.name,
                success: true,
                url: response.data.link,
                postId: response.data.id.toString(),
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
