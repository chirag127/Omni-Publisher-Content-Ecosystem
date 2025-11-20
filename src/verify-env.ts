import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load dotenv
dotenv.config();

console.log("=".repeat(80));
console.log("OMNI-PUBLISHER ENVIRONMENT VARIABLES DIAGNOSTIC TOOL");
console.log("=".repeat(80));
console.log("");

// 1. Check if .env file exists
const envPath = path.join(process.cwd(), ".env");
console.log("1. Checking .env file...");
try {
    const exists = fs.existsSync(envPath);
    if (exists) {
        console.log("   ✓ .env file exists at:", envPath);
        const stats = fs.statSync(envPath);
        console.log("   ✓ File size:", stats.size, "bytes");
    } else {
        console.log("   ✗ .env file NOT FOUND at:", envPath);
        console.log(
            "   → Please copy .env.example to .env and fill in your API keys"
        );
        process.exit(1);
    }
} catch (error: any) {
    console.log("   ✗ Error checking .env file:", error.message);
    process.exit(1);
}

console.log("");

// 2. List all environment variables loaded
console.log("2. Environment variables loaded:");
const envVars = [
    "DEV_TO_API_KEY",
    "HASHNODE_TOKEN",
    "HASHNODE_PUBLICATION_ID",
    "MEDIUM_INTEGRATION_TOKEN",
    "MEDIUM_USER_ID",
    "WORDPRESS_TOKEN",
    "WORDPRESS_SITE_ID",
    "BLOGGER_CLIENT_EMAIL",
    "BLOGGER_PRIVATE_KEY",
    "BLOGGER_BLOG_ID",
    "TUMBLR_CONSUMER_KEY",
    "TUMBLR_CONSUMER_SECRET",
    "TUMBLR_TOKEN",
    "TUMBLR_TOKEN_SECRET",
    "TUMBLR_BLOG_IDENTIFIER",
    "WIX_API_KEY",
    "WIX_SITE_ID",
    "TELEGRAPH_ACCESS_TOKEN",
    "MASTODON_INSTANCE_URL",
    "MASTODON_ACCESS_TOKEN",
    "NOTION_TOKEN",
    "NOTION_DATABASE_ID",
    "STRAPI_URL",
    "STRAPI_TOKEN",
    "LINKEDIN_ACCESS_TOKEN",
    "LINKEDIN_PERSON_URN",
    "REDDIT_CLIENT_ID",
    "REDDIT_CLIENT_SECRET",
    "REDDIT_USERNAME",
    "REDDIT_PASSWORD",
    "REDDIT_SUBREDDIT",
    "DISCORD_WEBHOOK_URL",
    "SHOWWCASE_API_KEY",
];

const loadedVars: string[] = [];
const missingVars: string[] = [];

for (const varName of envVars) {
    const value = process.env[varName];
    if (value && value.trim() !== "") {
        console.log(`   ✓ ${varName}: ${value.substring(0, 10)}...`);
        loadedVars.push(varName);
    } else {
        console.log(`   ✗ ${varName}: NOT SET`);
        missingVars.push(varName);
    }
}

console.log("");

// 3. Summary
console.log("3. Summary:");
console.log(`   Total variables checked: ${envVars.length}`);
console.log(`   Loaded: ${loadedVars.length}`);
console.log(`   Missing: ${missingVars.length}`);

console.log("");

// 4. Adapter Status
console.log("4. Adapter Status:");
const adapterConfigs = [
    {
        name: "Dev.to",
        required: ["DEV_TO_API_KEY"],
    },
    {
        name: "Hashnode",
        required: ["HASHNODE_TOKEN", "HASHNODE_PUBLICATION_ID"],
    },
    {
        name: "Medium",
        required: ["MEDIUM_INTEGRATION_TOKEN", "MEDIUM_USER_ID"],
    },
    {
        name: "WordPress",
        required: ["WORDPRESS_TOKEN", "WORDPRESS_SITE_ID"],
    },
    {
        name: "Blogger",
        required: [
            "BLOGGER_CLIENT_EMAIL",
            "BLOGGER_PRIVATE_KEY",
            "BLOGGER_BLOG_ID",
        ],
    },
    {
        name: "Tumblr",
        required: [
            "TUMBLR_CONSUMER_KEY",
            "TUMBLR_CONSUMER_SECRET",
            "TUMBLR_TOKEN",
            "TUMBLR_TOKEN_SECRET",
        ],
    },
    {
        name: "Wix",
        required: ["WIX_API_KEY", "WIX_SITE_ID"],
    },
    {
        name: "Telegraph",
        required: ["TELEGRAPH_ACCESS_TOKEN"],
    },
    {
        name: "Mastodon",
        required: ["MASTODON_ACCESS_TOKEN", "MASTODON_INSTANCE_URL"],
    },
    {
        name: "Notion",
        required: ["NOTION_TOKEN", "NOTION_DATABASE_ID"],
    },
    {
        name: "Strapi",
        required: ["STRAPI_URL", "STRAPI_TOKEN"],
    },
    {
        name: "LinkedIn",
        required: ["LINKEDIN_ACCESS_TOKEN", "LINKEDIN_PERSON_URN"],
    },
    {
        name: "Reddit",
        required: [
            "REDDIT_CLIENT_ID",
            "REDDIT_CLIENT_SECRET",
            "REDDIT_USERNAME",
            "REDDIT_PASSWORD",
        ],
    },
    {
        name: "Discord",
        required: ["DISCORD_WEBHOOK_URL"],
    },
];

let enabledCount = 0;
for (const adapter of adapterConfigs) {
    const allPresent = adapter.required.every(
        (varName) => process.env[varName] && process.env[varName]!.trim() !== ""
    );
    if (allPresent) {
        console.log(`   ✓ ${adapter.name}: ENABLED`);
        enabledCount++;
    } else {
        console.log(
            `   ✗ ${adapter.name}: DISABLED (missing: ${adapter.required
                .filter((v) => !process.env[v] || process.env[v]!.trim() === "")
                .join(", ")})`
        );
    }
}

console.log("");
console.log(
    `Total adapters enabled: ${enabledCount} / ${adapterConfigs.length}`
);

console.log("");
console.log("=".repeat(80));

// 5. Check for common issues
console.log("5. Common Issues Check:");

// Read .env file content to check for issues
const envContent = fs.readFileSync(envPath, "utf8");

// Check for BOM (Byte Order Mark)
if (envContent.charCodeAt(0) === 0xfeff) {
    console.log(
        "   ⚠ WARNING: .env file contains BOM (Byte Order Mark). This may cause issues."
    );
    console.log("      → Save the file as UTF-8 without BOM");
}

// Check for quotes around values
const lines = envContent.split("\n");
let hasQuotedValues = false;
for (const line of lines) {
    if (line.trim().startsWith("#") || !line.includes("=")) continue;
    const [, value] = line.split("=");
    if (value && (value.startsWith('"') || value.startsWith("'"))) {
        hasQuotedValues = true;
        break;
    }
}
if (hasQuotedValues) {
    console.log(
        "   ℹ INFO: Some values are quoted. This is usually fine, but dotenv will include the quotes."
    );
    console.log("      → If you have issues, try removing quotes from values");
}

// Check for empty lines before keys
const hasEmptyLines = envContent.includes("\n\n");
if (hasEmptyLines) {
    console.log("   ℹ INFO: .env file has empty lines (this is OK)");
}

console.log("");
console.log("=".repeat(80));
console.log("Diagnostic complete!");
console.log("");

if (enabledCount === 0) {
    console.log("⚠ WARNING: No adapters are enabled!");
    console.log("→ Add at least one set of API credentials to your .env file");
    console.log("→ See .env.example for instructions on how to get API keys");
} else {
    console.log(`✓ ${enabledCount} adapter(s) ready to use!`);
}

console.log("=".repeat(80));
