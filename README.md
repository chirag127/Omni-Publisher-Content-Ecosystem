-   [Roadmap](#-roadmap)
-   [FAQ](#-faq)
-   [Contributing](#-contributing)
-   [Support](#-support)
-   [License](#-license)
-   [Credits & Acknowledgments](#-credits--acknowledgments)

---

## 🌟 About

**Omni-Publisher** is a powerful, modern content distribution system designed for developers, technical writers, and content creators who want to maximize their reach without the hassle of manual cross-posting. Write your content once in Markdown, and let Omni-Publisher handle the rest.

Built with **Node.js 22**, **TypeScript**, and modern tooling, this system offers:

-   ✅ **Zero manual copying** - Automated publishing to 15+ platforms
-   ✅ **Idempotent operations** - Never publish the same content twice
-   ✅ **Resilient architecture** - Handles API failures gracefully with exponential backoff
-   ✅ **Static site generation** - Beautiful, SEO-optimized blog site included
-   ✅ **CI/CD ready** - GitHub Actions workflows for automated deployments

### Use Cases

-   📝 **Technical Bloggers** - Share tutorials across Dev.to, Hashnode, Medium, and more
-   🏢 **Developer Advocates** - Distribute company content to multiple channels
-   💼 **Content Marketers** - Maximize reach for SEO and brand awareness
-   🚀 **Startups** - Build thought leadership across platforms

---

## ✨ Key Features

### 🌐 Multi-Platform Publishing

Publish to **21 platforms** simultaneously, including:

-   **Developer Communities**: Dev.to, Hashnode, Showwcase
-   **Mainstream**: Medium, WordPress.com, LinkedIn
-   **Social Media Link Sharing**: Telegram, Bluesky, X/Twitter, Threads, Facebook
-   **Social**: Tumblr, Mastodon, Reddit, Discord
-   **Enterprise**: Notion, Strapi
-   **CMS**: Blogger, Wix
-   **Anonymous**: Telegraph

### 🛡️ Resilient Publishing Engine

-   **Parallel processing** with configurable concurrency limits
-   **Exponential backoff** retry logic (3 attempts)
-   **Idempotency checks** via `.postmap.json` state tracking
-   **Graceful error handling** - one platform failure won't break others
-   **Dry-run mode** for safe testing

### 🎨 Static Site Generator

-   Fast, SEO-optimized HTML generation
-   Responsive design with modern CSS
-   Automatic sitemap creation
-   RSS feed support
-   GitHub Pages ready

### 🤖 Automated Workflows

GitHub Actions for:

-   **Daily publishing** - Automated content distribution
-   **Site deployment** - Push to GitHub Pages
-   **Issue-to-post** - Convert GitHub issues to blog posts

### 🔒 Security & Type Safety

-   **100% TypeScript** with strict mode enabled
-   **Environment variable validation**
-   **No hardcoded secrets** - `.env` based configuration
-   **Secure token storage** practices

### 🛠️ Modern Tooling

-   **pnpm** - Fast, disk-efficient package management
-   **Biome.js** - Lightning-fast linting and formatting
    See [`.env.example`](.env.example) for the complete list with detailed comments.

---

## 🔐 Setting up GitHub Secrets

To enable the GitHub Actions workflows (like daily publishing), you need to add your environment variables to your GitHub repository's secrets.

### The Easiest Way (Recommended)

If you have the [GitHub CLI](https://cli.github.com/) installed, you can import your local `.env` file directly:

```bash
# 1. Login to GitHub CLI (if not already logged in)
gh auth login

# 2. Bulk import all secrets from your .env file
gh secret set -f .env
```

### Manual Method

1. Go to your repository on GitHub.
2. Navigate to **Settings** → **Secrets and variables** → **Actions**.
3. Click **"New repository secret"**.
4. Add each variable from your `.env` file (e.g., `DEVTO_API_KEY`, `HASHNODE_TOKEN`).

> **Note:** Ensure your `.env` file is populated with valid keys before importing.

---

## 🔑 Comprehensive API Keys & Tokens Guide

This section provides **step-by-step instructions** for obtaining API keys and tokens for every supported platform. Follow the guides below to configure your publishing ecosystem.

> **🔒 Security First:** Never commit your `.env` file or share your API keys publicly. Treat them like passwords.

---

### 1. 📘 Dev.to API Key

**What it's for:** Publishing articles to the Dev.to developer community.

**Steps to obtain:**

1. **Log in** to your [Dev.to account](https://dev.to/)
2. Navigate to **Settings** (click your profile picture → Settings)
3. Click **Extensions** in the left sidebar
4. Scroll down to **"DEV Community API Keys"**
5. Enter a description (e.g., "Omni-Publisher Integration")
6. Click **"Generate API Key"**
7. **Copy the key** immediately and save it to your `.env`:
    ```env
    DEVTO_API_KEY=your_generated_key_here
    ```

**📖 Documentation:** [dev.to/api](https://developers.forem.com/api)

**⚠️ Notes:**

-   The key grants full access to your account
-   You can revoke and regenerate keys anytime
-   Rate limit: 10 requests per 30 seconds (per endpoint)

---

### 2. 📗 Hashnode Personal Access Token (PAT)

**What it's for:** Publishing articles to Hashnode via GraphQL API.

**Steps to obtain:**

1. **Log in** to [Hashnode](https://hashnode.com/)
2. Go to **Account Settings** → **Developer**
3. Click **"Generate New Token"** under Personal Access Tokens
4. Provide a name (e.g., "Omni-Publisher")
5. **Copy the token** immediately (it won't be shown again):
    ```env
    HASHNODE_TOKEN=your_pat_token_here
    ```

**📖 Documentation:** [api.hashnode.com](https://api.hashnode.com/)

**⚠️ Notes:**

-   Uses GraphQL API (v3)
-   Token has full account permissions
-   No rate limits on free tier (fair use policy)

---

### 3. 📙 Medium Integration Token

**What it's for:** Publishing articles to Medium (legacy feature).

> **⚠️ CRITICAL WARNING (Late 2025):** Medium has **permanently closed its API to new integrations** as of early 2025.
>
> -   **New Users:** You CANNOT generate a new token. This platform is effectively unavailable for automated publishing unless you already have a token.
> -   **Existing Users:** If you generated a token before Jan 2025, it _may_ still work, but support is not guaranteed.

**Steps to obtain (Legacy/Grandfathered only):**

1. **Log in** to [Medium](https://medium.com/)
2. Go to **Settings** → **Security and apps** → **Integration tokens**
3. If the option exists, click **"Get integration token"**
4. Copy the token to your `.env`:
    ```env
    MEDIUM_TOKEN=your_medium_token_here
    ```

**📖 Documentation:** [github.com/Medium/medium-api-docs](https://github.com/Medium/medium-api-docs) (Archived)

**Alternative:** Consider using the **Unofficial Medium API** (via RapidAPI) if you strictly need automation, though this requires a separate subscription and adapter modification.

---

### 4. 🌐 WordPress.com OAuth Token (or Application Password)

**What it's for:** Publishing to your WordPress.com blog.

**Method A: Application Passwords (Recommended for Personal Scripts)**
_Easiest method for single-user automation._

1. **Log in** to your WordPress.com account.
2. Go to **[https://wordpress.com/me/security/two-step-authentication](https://wordpress.com/me/security/two-step-authentication)** (Security Settings).
3. Scroll down to **"Application Passwords"**.
4. Enter a name (e.g., "Omni-Publisher") and click **"Generate Password"**.
5. **Copy the password** immediately.
6. Add to `.env` (Note: Use `WORDPRESS_TOKEN` for the password):
    ```env
    WORDPRESS_TOKEN=your_generated_app_password
    WORDPRESS_SITE_ID=yourblog.wordpress.com
    # Note: For this method, the adapter might need slight adjustment to use Basic Auth instead of Bearer.
    # If using standard OAuth (Method B), keep as is.
    ```

**Method B: OAuth 2.0 (Standard)**
_Required if you want to distribute this tool to other users._

1. **Create a WordPress.com application:**

    - Visit [developer.wordpress.com/apps](https://developer.wordpress.com/apps/)
    - Click **"Create New Application"**
    - Fill in details:
        - **Name:** Omni-Publisher
        - **Description:** Content publishing automation
        - **Website:** Your blog URL
        - **Redirect URL:** `http://localhost:3000/callback` (for local testing)
    - **Type:** Web

2. **Get your credentials:**

    - After creating, note your **Client ID** and **Client Secret**

3. **Generate OAuth token:**

    - Use this URL (replace `CLIENT_ID`):

    ```
    https://public-api.wordpress.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/callback&response_type=token
    ```

    - Authorize the app
    - Extract the `access_token` from the redirect URL

4. **Add to `.env`:**
    ```env
    WORDPRESS_TOKEN=your_oauth_token_here
    WORDPRESS_SITE_ID=yourblog.wordpress.com
    ```

**📖 Documentation:** [developer.wordpress.com/docs/api](https://developer.wordpress.com/docs/api/)

---

### 5. 📧 Blogger OAuth 2.0

**What it's for:** Publishing to your Blogger/Blogspot blog via Google APIs.

**Steps to obtain:**

1. **Create a Google Cloud Project:**

    - Go to [console.cloud.google.com](https://console.cloud.google.com/)
    - Click **"Create Project"**
    - Name it (e.g., "Omni-Publisher Blogger")

2. **Enable Blogger API:**

    - In the project dashboard, go to **"APIs & Services"** → **"Library"**
    - Search for **"Blogger API v3"**
    - Click **"Enable"**

3. **Create OAuth Credentials:**

    - Go to **"APIs & Services"** → **"Credentials"**
    - Click **"Create Credentials"** → **"OAuth client ID"**
    - Application type: **"Web application"**
    - Name: "Omni-Publisher"
    - **Authorized redirect URIs:** Add `http://localhost:3000/callback`
    - Click **"Create"**

4. **Get Client ID and Secret:**

    - Copy the **Client ID** and **Client Secret**
    - Add them to your `.env` file:

    ```env
    BLOGGER_CLIENT_ID=your_client_id
    BLOGGER_CLIENT_SECRET=your_client_secret
    ```

5. **Generate Refresh Token:**

    - Run the helper script included in this repo:

    ```bash
    npx tsx scripts/get-blogger-token.ts
    ```

    - Follow the on-screen instructions to log in.
    - Copy the generated `BLOGGER_REFRESH_TOKEN` to your `.env`.

6. **Get Blog ID:**

    - Log in to your [Blogger Dashboard](https://www.blogger.com/).
    - Look at the URL in your browser address bar.
    - It will look like: `https://www.blogger.com/blog/posts/1234567890123456789`
    - The number at the end (`1234567890123456789`) is your **Blog ID**.
    - Add it to `BLOGGER_BLOG_ID` in your `.env`.

**📖 Documentation:** [developers.google.com/blogger](https://developers.google.com/blogger)

**⚠️ Notes:**

-   This method uses standard Google Login (OAuth 2.0).
-   The refresh token allows the app to publish indefinitely without re-login.

---

### 6. 🎨 Tumblr OAuth 1.0a

**What it's for:** Publishing posts to your Tumblr blog.

**Steps to obtain:**

1. **Register an application:**

    - Visit [www.tumblr.com/oauth/apps](https://www.tumblr.com/oauth/apps)
    - Click **"Register application"**
    - Fill in:
        - **Application Name:** Omni-Publisher
        - **Application Website:** Your blog URL
        - **Default callback URL:** `http://localhost:3000/callback`
    - Agree to terms and register

2. **Get credentials:**

    - After registration, note:
        - **OAuth Consumer Key**
        - **Secret Key**

3. **Generate access tokens:**

    - Use a tool like [Postman](https://www.postman.com/) or [tumblr-oauth-tool](https://github.com/tumblr/tumblr.js)
    - Or use this helper: [mkromer.github.io/tumblr-oauth](https://mkromer.github.io/tumblr-oauth/)
    - Complete OAuth 1.0a flow to get:
        - **OAuth Token**
        - **OAuth Token Secret**

4. **Add to `.env`:**
    ```env
    TUMBLR_CONSUMER_KEY=your_consumer_key
    TUMBLR_CONSUMER_SECRET=your_secret_key
    TUMBLR_TOKEN=your_oauth_token
    TUMBLR_TOKEN_SECRET=your_oauth_token_secret
    TUMBLR_BLOG_IDENTIFIER=yourblog.tumblr.com
    ```

**📖 Documentation:** [www.tumblr.com/docs/api/v2](https://www.tumblr.com/docs/en/api/v2)

**⚠️ Notes:**

-   Uses legacy OAuth 1.0a (more complex than OAuth 2.0)
-   Requires both consumer credentials AND user tokens

---

### 7. 🌐 Wix API Key

**What it's for:** Publishing to your Wix blog.

**Steps to obtain:**

1.  **Create a Wix site** (if you don't have one):

    -   Visit [wix.com](https://www.wix.com/) and create a free site with a blog

2.  **Access API settings:**

        - Go to your Wix Dashboard
        - Navigate to **Settings** → **Business Info** → **API Keys**

    **📖 Documentation:** [dev.wix.com/api/rest](https://dev.wix.com/api/rest/getting-started)

**⚠️ Notes:**

-   Requires a Wix site with blog module enabled
-   Free tier has API rate limits

---

### 8. ✈️ Telegraph Access Token

**What it's for:** Publishing anonymous articles to Telegraph (by Telegram).

**Steps to obtain:**

1. **Create an account via API:**

    ```bash
    curl https://api.telegra.ph/createAccount?short_name=YourName&author_name=YourName
    ```

2. **Extract the `access_token` from the JSON response:**

    ```json
    {
        "ok": true,
        "result": {
            "access_token": "abcd1234xyz...",
            "auth_url": "..."
        }
    }
    ```

3. **Add to `.env`:**
    ```env
    TELEGRAPH_TOKEN=your_access_token_here
    ```

**📖 Documentation:** [telegra.ph/api](https://telegra.ph/api)

**⚠️ Notes:**

-   **Anonymous platform** - no user account required
-   Articles cannot be edited after 24 hours
-   No authentication required for reading

---

### 9. 🐘 Mastodon Bearer Token

**What it's for:** Posting content updates to Mastodon (federated social network).

**Steps to obtain:**

1. **Choose a Mastodon instance** (e.g., mastodon.social, fosstodon.org)
2. **Register an application:**

    - Go to your instance: `https://your-instance.com/settings/applications`
    - Click **"New Application"**
    - Fill in:
        - **Application Name:** Omni-Publisher
        - **Scopes:** `write:statuses`
    - Click **"Submit"**

3. **Get your token:**

    - Click on your newly created application
    - Copy the **Access Token**

4. **Add to `.env`:**
    ```env
    MASTODON_TOKEN=your_bearer_token
    MASTODON_INSTANCE_URL=https://mastodon.social
    ```

**📖 Documentation:** [docs.joinmastodon.org/client/intro](https://docs.joinmastodon.org/client/intro/)

**⚠️ Notes:**

-   Works with any Mastodon instance
-   Posts are public by default (configure visibility in adapter)

---

### 10. 📔 Notion Integration Secret

**What it's for:** Publishing content to a Notion database.

**Steps to obtain:**

1. **Create a Notion integration:**

    - Visit [www.notion.so/my-integrations](https://www.notion.so/my-integrations)
    - Click **"New integration"**
    - Fill in:
        - **Name:** Omni-Publisher
        - **Associated workspace:** Select your workspace
    - Click **"Submit"**

2. **Copy the Internal Integration Token**

3. **Share your database with the integration:**

    - Open your Notion database (create one if needed)
    - Click **"..."** (three dots) → **"Add connections"**
    - Search for your integration name and add it

4. **Get your database ID:**

    - Open the database as a full page
    - Copy the ID from URL: `https://www.notion.so/YOUR_DATABASE_ID?v=...`

5. **Add to `.env`:**
    ```env
    NOTION_TOKEN=secret_your_integration_token
    NOTION_DATABASE_ID=your_database_id
    ```

**📖 Documentation:** [developers.notion.com](https://developers.notion.com/)

**⚠️ Notes:**

-   Database must have properties: Title, Content, Published (checkbox)
-   Integration needs write permissions

---

### 11. 🚀 Strapi API Token

**What it's for:** Publishing to a Strapi headless CMS.

**Steps to obtain:**

1. **Set up Strapi instance:**

    - Use [Strapi Cloud](https://strapi.io/cloud) or self-host
    - Create a **Blog** content type with fields: `title`, `content`

2. **Generate API token:**

    - In Strapi admin: **Settings** → **API Tokens**
    - Click **"Create new API Token"**
    - Fill in:
        - **Name:** Omni-Publisher
        - **Token type:** Full access
    - Click **"Save"** and copy the token

3. **Add to `.env`:**
    ```env
    STRAPI_TOKEN=your_api_token
    STRAPI_URL=https://your-strapi-instance.com
    ```

**📖 Documentation:** [docs.strapi.io/dev-docs/api/rest](https://docs.strapi.io/dev-docs/api/rest)

**⚠️ Notes:**

-   Requires running Strapi instance
-   Free cloud tier available

---

### 12. 💼 LinkedIn OAuth 2.0

**What it's for:** Posting articles to your LinkedIn profile.

**Steps to obtain:**

1. **Create LinkedIn App:**

    - Visit [www.linkedin.com/developers/apps](https://www.linkedin.com/developers/apps)
    - Click **"Create app"**
    - Fill in required details
    - Verify your app

2. **Request API access:**

    - In app settings, go to **Products**
    - Request access to **"Share on LinkedIn"**

3. **Get credentials:**

    - Go to **Auth** tab
    - Note **Client ID** and **Client Secret**
    - Add redirect URL: `http://localhost:3000/callback`

4. **Generate access token:**

    - Use OAuth 2.0 flow (authorization code grant)
    - Use this URL:

    ```
    https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost:3000/callback&scope=w_member_social
    ```

---

### 13. 🔴 Reddit OAuth 2.0

**What it's for:** Posting to your subreddit or profile.

**⚠️ Important (2025 Update):** Reddit has tightened API access. You may need to request approval for your app, even for personal scripts.

**Steps to obtain:**

1. **Create Reddit App:**

    - Visit [www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
    - Scroll down and click **"create another app..."**
    - Fill in:
        - **Name:** Omni-Publisher
        - **App type:** Select **"script"** (Critical for personal use)
        - **Redirect URI:** `http://localhost:8080`
    - Click **"create app"**

2. **Get credentials:**

    - Note the **Client ID** (under app name)
    - Note the **Secret**

3. **Add to `.env`:**
    ```env
    REDDIT_CLIENT_ID=your_client_id
    REDDIT_CLIENT_SECRET=your_client_secret
    REDDIT_USERNAME=your_reddit_username
    REDDIT_PASSWORD=your_reddit_password
    REDDIT_SUBREDDIT=subreddit_name
    ```

**📖 Documentation:** [www.reddit.com/dev/api](https://www.reddit.com/dev/api/)

**⚠️ Notes:**

-   Uses **Password Grant** flow (script type apps only)
-   Ensure you have posting permissions in the target subreddit
-   **User-Agent:** The adapter uses `OmniPublisher/1.0`. If you get blocked, you may need to update this in `src/adapters/reddit.ts` to `android:com.example.omnipublisher:v1.0 (by /u/yourusername)`.

---

### 14. 💬 Discord Webhook URL

**What it's for:** Posting content notifications to a Discord channel.

**Steps to obtain:**

1. **Open Discord** and navigate to your server
2. **Edit channel:**

    - Right-click the channel → **"Edit Channel"**
    - Go to **"Integrations"**

3. **Create webhook:**

    - Click **"Webhooks"** → **"New Webhook"**
    - Name it: "Omni-Publisher"
    - Choose the channel
    - Click **"Copy Webhook URL"**

4. **Add to `.env`:**
    ```env
    DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
    ```

**📖 Documentation:** [discord.com/developers/docs/resources/webhook](https://discord.com/developers/docs/resources/webhook)

**⚠️ Notes:**

-   Webhooks are per-channel
-   Can include embeds for rich formatting

---

### 15. 🌟 Showwcase API Key

**What it's for:** Publishing to Showwcase developer portfolio platform.

**⚠️ Status:** API is currently in beta/private access. Placeholder adapter exists but is not functional.

**Steps to obtain (when available):**

-   Check [showwcase.com/developers](https://www.showwcase.com/) for API access

---

### 16. 📱 Telegram Bot API Token

**What it's for:** Share blog post links to Telegram channels.

**Steps to obtain:**

1. **Create a Telegram Bot:**

    - Open Telegram and search for **@BotFather**
    - Send `/newbot` and follow the instructions
    - Choose a name and username for your bot
    - **Copy the Bot Token** provided

2. **Add bot to your channel:**

    - Create a channel or use an existing one
    - Add your bot as an administrator
    - Give it permission to post messages

3. **Get your Channel ID:**

    - For public channels: use `@channelname` format
    - For private channels: Forward a message from the channel to **@userinfobot** to get the numeric ID

4. **Add to `.env`:**
    ```env
    TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
    TELEGRAM_CHANNEL_ID=@yourchannel
    ```

**📖 Documentation:** [core.telegram.org/bots/api](https://core.telegram.org/bots/api)

**⚠️ Notes:**

-   Free tier allows 30 messages per second
-   Bot can post to multiple channels
-   Supports Markdown formatting

---

### 17. 🦋 Bluesky App Password

**What it's for:** Share blog post links to Bluesky social network via AT Protocol.

**Steps to obtain:**

1. **Create a Bluesky account** at [bsky.app](https://bsky.app) (if you don't have one)

2. **Generate App Password:**

    - Log in to your Bluesky account
    - Go to **Settings** → **App Passwords**
    - Click **"Add App Password"**
    - Name it (e.g., "Omni-Publisher")
    - Click **"Create App Password"**
    - **Copy the generated password immediately** (shown only once)

3. **Add to `.env`:**
    ```env
    BLUESKY_HANDLE=yourname.bsky.social
    BLUESKY_APP_PASSWORD=your-app-password-here
    ```

**📖 Documentation:** [docs.bsky.app](https://docs.bsky.app/)

**⚠️ Notes:**

-   App passwords are safer than using your main password
-   Rate limit: 3000 points per 5 minutes (creating posts = 3 points each)
-   Supports rich text and link embedding

---

### 18. 🐦 X (Twitter) API Credentials

**What it's for:** Share blog post links as tweets on X/Twitter.

**Steps to obtain:**

1. **Apply for Developer Account:**

    - Go to [developer.twitter.com](https://developer.twitter.com/)
    - Click **"Sign up"** and complete the application
    - Describe your use case (e.g., "Automated blog post sharing")
    - Wait for approval (usually instant for basic access)

2. **Create a Project and App:**

    - In the Developer Portal, click **"Create Project"**
    - Name your project
    - Click **"Create App"** within the project
    - Name your app (e.g., "Omni-Publisher")

3. **Set App Permissions:**

    - Go to your app's settings
    - Click **"User authentication settings"** → **"Set up"**
    - App permissions: **"Read and write"**
    - Type of App: **"Web App, Automated App or Bot"**
    - Save changes

4. **Generate API Keys:**

    - Go to **"Keys and tokens"** tab
    - Under **"Consumer Keys"**, click **"Generate"** (if not already generated)
    - Copy **API Key** and **API Key Secret**
    - Under **"Authentication Tokens"**, click **"Generate"**
    - Copy **Access Token** and **Access Token Secret**

5. **Add to `.env`:**
    ```env
    TWITTER_API_KEY=your_api_key
    TWITTER_API_SECRET=your_api_secret
    TWITTER_ACCESS_TOKEN=your_access_token
    TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
    ```

**📖 Documentation:** [developer.twitter.com/en/docs/twitter-api](https://developer.twitter.com/en/docs/twitter-api)

**⚠️ Notes:**

-   **Free Tier Limits:** 1,500 tweets per month (~50 per day)
-   Uses OAuth 1.0a for authentication
-   Character limit: 280 characters including link

---

### Publishing Content

#### Basic Publishing

```bash
# Publish all posts to enabled platforms
pnpm start
```

#### Dry Run (Test Mode)

```bash
# Preview what would be published without actually publishing
pnpm start -- --dry-run
```

#### Force Re-publish

```bash
# Re-publish posts even if already published
pnpm start -- --force
```

#### Filter by Platform

```bash
# Publish only to specific platforms (modify publish.ts)
pnpm start -- --platforms=devto,hashnode
```

### Managing Content

#### Creating a New Post

Create a new Markdown file in `content/posts/`:

```bash
# Filename format: YYYY-MM-DD-Title-Slug.md
touch content/posts/2025-01-15-My-Awesome-Post.md
```

**Example post structure:**

```markdown
---
title: "My Awesome Post"
description: "A brief description for SEO"
tags: ["javascript", "tutorial", "webdev"]
canonical_url: "https://yourblog.com/my-awesome-post"
cover_image: "./images/cover.jpg"
published: true
---

# My Awesome Post

Your content here...
```

#### Generate Seed Content

```bash
# Generate 50+ sample blog posts
pnpm run seed
```

### Building the Static Site

```bash
# Generate HTML site in public/
pnpm run build

# Preview locally (requires a static server)
npx serve public
```

### Deployment

```bash
# Deploy to GitHub Pages (automated via GitHub Actions)
pnpm run deploy
```

---

## 📂 Project Structure

```
omni-publisher9/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       ├── deploy-site.yml
│       ├── publish-content.yml
│       └── issue-to-post.yml
├── content/
│   └── posts/              # Markdown blog posts (YYYY-MM-DD-Title.md)
├── public/                 # Generated static site (gitignored)
├── src/
│   ├── adapters/           # Platform-specific publishing logic
│   │   ├── devto.ts
│   │   ├── hashnode.ts
│   │   ├── medium.ts
│   │   └── ... (15+ adapters)
│   ├── utils/
│   │   ├── logger.ts      # Structured JSON logging
│   │   ├── markdown.ts    # Markdown to HTML parser
│   │   ├── state.ts       # .postmap.json state manager
│   │   └── retry.ts       # Exponential backoff retry logic
│   ├── publish.ts         # Main publisher CLI
│   └── build-site.ts      # Static site generator
├── .env.example           # Environment template
├── .postmap.json          # Publishing state (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🤖 GitHub Actions Workflows

### 1. Deploy Site (`deploy-site.yml`)

**Trigger:** Push to `main` branch
**Purpose:** Build and deploy static site to GitHub Pages

```yaml
name: Deploy Site
on:
    push:
        branches: [main]
jobs:
    build-deploy:
        runs-on: ubuntu-latest
        steps:
            - Checkout
            - Setup Node.js 22
            - Install dependencies
            - Build site
            - Deploy to gh-pages
```

### 2. Publish Content (`publish-content.yml`)

**Trigger:** Daily at 9 AM UTC (customizable)
**Purpose:** Automatically publish new/unpublished posts

```yaml
name: Publish Content
on:
    schedule:
        - cron: "0 9 * * *" # Daily at 9 AM UTC
    workflow_dispatch: # Manual trigger
```

### 3. Issue to Post (`issue-to-post.yml`)

**Trigger:** New GitHub issue with label `blog-post`
**Purpose:** Convert issue body to Markdown post

```yaml
name: Issue to Post
on:
    issues:
        types: [opened, labeled]
```

---

## 🛠️ Troubleshooting

### Common Issues

#### ❌ Error: "API Key not found"

**Solution:**

-   Ensure `.env` file exists in project root
-   Verify the exact variable name matches adapter expectations
-   Check for typos in `.env` keys

#### ❌ Error: "Rate limit exceeded"

**Solution:**

-   Wait for the rate limit reset (typically 15 minutes)
-   Reduce `CONCURRENCY` value in `.env`
-   Enable `--dry-run` to test without hitting APIs

#### ❌ Error: "Post already published"

**Solution:**

-   This is expected behavior (idempotency)
-   Use `--force` flag to re-publish: `pnpm start -- --force`
-   Delete specific entry from `.postmap.json` to republish selectively

#### ❌ Error: "Markdown parsing failed"

**Solution:**

-   Ensure frontmatter is valid YAML (wrapped in `---`)
-   Check for special characters in title/description
-   Validate markdown syntax

#### ❌ Build fails on GitHub Actions

**Solution:**

-   Verify all secrets are added in **Settings** → **Secrets and variables** → **Actions**
-   Check Node.js version matches (22+)
-   Review workflow logs for specific errors

### Platform-Specific Issues

#### Medium: "Token invalid"

-   Medium closed API for new users (Jan 2025)
-   If you have an old token, ensure it's not expired
-   Consider removing Medium from your `.env`

#### WordPress: "Unauthorized"

-   OAuth tokens expire - regenerate a new token
-   Verify `WORDPRESS_SITE_ID` is correct (your-blog.wordpress.com)

#### LinkedIn: "Insufficient permissions"

-   Ensure "Share on LinkedIn" product is approved
-   Regenerate token with `w_member_social` scope

### Debug Mode

Enable verbose logging:

```bash
# Set in .env
DEBUG=true

# Or inline
DEBUG=true pnpm start
```

---

## 🗺️ Roadmap

### Q1 2025

-   [ ] Add support for Substack (unofficial API)
-   [ ] Implement content scheduling (publish at specific times)
-   [ ] Add image optimization pipeline

### Q2 2025

-   [ ] Analytics dashboard (track post performance)
-   [ ] Support for video content (YouTube, Vimeo)
-   [ ] Multi-language content support

### Q3 2025

-   [ ] AI-powered SEO optimization suggestions
-   [ ] Cross-post comments sync
-   [ ] Mobile app for content management

### Future

-   [ ] Plugin system for custom adapters
-   [ ] Web UI for managing posts
-   [ ] Collaborative editing features

**Vote on features:** [GitHub Discussions](https://github.com/chirag127/omni-publisher9/discussions)

---

## ❓ FAQ

**Q: Do I need accounts on all 15 platforms?**
A: No! Only add API keys for platforms you want to use. The publisher skips platforms without credentials.

**Q: Will this duplicate my content and hurt SEO?**
A: Use the `canonical_url` field in frontmatter to point to your primary blog. Search engines will recognize it as the authoritative source.

**Q: Can I customize the content for each platform?**
A: Yes! Adapters can be modified to format content differently per platform. See `/src/adapters/` for implementation details.

**Q: Is this safe for production use?**
A: Yes! The system includes retry logic, error handling, and idempotency checks. Start with `--dry-run` to test.

**Q: Can I use this for commercial purposes?**
A: Yes, the project is MIT licensed. Use it freely for personal or commercial projects.

**Q: How do I add a new platform?**
A: Create a new adapter in `/src/adapters/` following the existing patterns. See [Contributing Guide](#-contributing).

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/omni-publisher9.git
cd omni-publisher9

# Install dependencies
pnpm install

# Create a branch
git checkout -b feature/my-new-feature

# Make your changes and test
pnpm run lint
pnpm run format
pnpm test

# Commit and push
git commit -m "Add: My new feature"
git push origin feature/my-new-feature
```

### Adding a New Platform Adapter

1. Create `/src/adapters/newplatform.ts`
2. Implement the `publish()` function:
    ```typescript
    export async function publish(post: Post): Promise<PublishResult> {
        // Your implementation
    }
    ```
3. Add environment variables to `.env.example`
4. Update this README with setup instructions
5. Submit a pull request!

### Code Standards

-   **TypeScript:** Strict mode, no `any` types
-   **Formatting:** Biome.js (run `pnpm format`)
-   **Commits:** Conventional commits (`feat:`, `fix:`, `docs:`)
-   **Tests:** Write tests for new adapters

### Reporting Bugs

Open an issue with:

-   Platform affected
-   Error message
-   Steps to reproduce
-   Your environment (Node version, OS)

---

## 💬 Support

-   Dev.to, Hashnode, Medium, WordPress, Blogger, Tumblr, Wix, Telegraph, Mastodon, Notion, Strapi, LinkedIn, Reddit, Discord, Showwcase

### Inspiration

-   [Forem](https://www.forem.com/) - Open-source community platform
-   [Crosspost](https://github.com/kentcdodds/cross-post) by Kent C. Dodds
-   The awesome developer community ❤️

### Contributors

Thanks to all contributors who have helped improve this project! 🎉

[![Contributors](https://contrib.rocks/image?repo=chirag127/omni-publisher9)](https://github.com/chirag127/omni-publisher9/graphs/contributors)

---

<div align="center">

**Made with ❤️ by [Chirag Singhal](https://github.com/chirag127)**

If this project helped you, consider giving it a ⭐️!

[![Star History Chart](https://api.star-history.com/svg?repos=chirag127/omni-publisher9&type=Date)](https://star-history.com/#chirag127/omni-publisher9&Date)

</div>
