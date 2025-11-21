import path from "path";
import fs from "fs/promises";
import { logger } from "./utils/logger.js";
import { markdownToHtml, parseMarkdown } from "./utils/markdown.js";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const ASSETS_DIR = path.join(PUBLIC_DIR, "assets");

async function buildSite() {
  logger.info("Building static site...");

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.mkdir(ASSETS_DIR, { recursive: true });

  // Create styles.css
  const cssContent = `
    body { font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
    header { margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.9rem; }
    article { margin-bottom: 3rem; }
    a { color: #0070f3; text-decoration: none; }
    a:hover { text-decoration: underline; }
    pre { background: #f4f4f4; padding: 1rem; overflow-x: auto; border-radius: 4px; }
    img { max-width: 100%; height: auto; }
  `;
  await fs.writeFile(path.join(ASSETS_DIR, "styles.css"), cssContent);

  const files = await fs.readdir(POSTS_DIR);
  const posts = [];

  for (const file of files) {
    if (file.endsWith(".md")) {
      const content = await fs.readFile(path.join(POSTS_DIR, file), "utf-8");
      const post = parseMarkdown(content);
      if (!post.slug) post.slug = file.replace(".md", "");

      const htmlContent = markdownToHtml(post.content);

      // Create individual post page
      const postHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.title} - Omni-Publisher</title>
  <meta name="description" content="${post.description || ""}">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header>
    <a href="/">← Back to Home</a>
  </header>
  <main>
    <article>
      <h1>${post.title}</h1>
      <div class="meta">
        ${post.tags ? `Tags: ${post.tags.join(", ")}` : ""}
      </div>
      <div class="content">
        ${htmlContent}
      </div>
    </article>
  </main>
  <footer>
    <p>Powered by Omni-Publisher</p>
  </footer>
</body>
</html>
      `;

      await fs.writeFile(path.join(PUBLIC_DIR, `${post.slug}.html`), postHtml);
      posts.push(post);
    }
  }

  // Create index.html
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Omni-Publisher Blog</title>
  <meta name="description" content="A blog published by Omni-Publisher">
  <link rel="stylesheet" href="/assets/styles.css">
</head>
<body>
  <header>
    <h1>Omni-Publisher Blog</h1>
    <p>Automated content distribution ecosystem.</p>
  </header>
  <main>
    ${posts
      .map(
        (post) => `
      <article>
        <h2><a href="/${post.slug}.html">${post.title}</a></h2>
        <p>${post.description || ""}</p>
        <div class="meta">
          ${post.tags ? `Tags: ${post.tags.join(", ")}` : ""}
        </div>
      </article>
    `,
      )
      .join("")}
  </main>
  <footer>
    <p>Powered by Omni-Publisher</p>
  </footer>
</body>
</html>
  `;

  await fs.writeFile(path.join(PUBLIC_DIR, "index.html"), indexHtml);

  logger.info(`Site built successfully with ${posts.length} posts.`);
}

buildSite().catch((error) => {
  logger.error("Error building site", { error });
  process.exit(1);
});
