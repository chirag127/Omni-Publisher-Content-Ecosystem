export interface Post {
    title: string;
    slug: string;
    content: string;
    description?: string;
    date?: string;
    tags?: string[];
    coverImage?: string;
    frontmatter: Record<string, any>;
}

export interface PublishResult {
    platform: string;
    success: boolean;
    url?: string;
    error?: string;
    postId?: string;
}

export interface Adapter {
    name: string;
    enabled: boolean;
    publish(post: Post): Promise<PublishResult>;
    validate(): Promise<boolean>;
}

export interface Config {
    dryRun: boolean;
    concurrency: number;
    filter?: string;
}

export interface PostMap {
    [slug: string]: {
        [platform: string]: string; // URL
    };
}
