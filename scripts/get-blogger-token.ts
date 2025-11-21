import "dotenv/config";
import http from "http";
import url from "url";
import { google } from "googleapis";
import { exec } from "child_process";

// Configuration
const SCOPES = ["https://www.googleapis.com/auth/blogger"];
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

async function main() {
    console.log("==================================================");
    console.log("   Blogger OAuth 2.0 Token Generator");
    console.log("==================================================");
    console.log(
        "\nThis script will help you generate the Refresh Token needed for the new Blogger adapter."
    );
    console.log(
        "You will need a Client ID and Client Secret from the Google Cloud Console.\n"
    );

    const clientId = process.env.BLOGGER_CLIENT_ID;
    const clientSecret = process.env.BLOGGER_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error(
            "❌ Error: BLOGGER_CLIENT_ID and BLOGGER_CLIENT_SECRET must be set in your .env file first."
        );
        console.error(
            "   Please go to Google Cloud Console -> APIs & Services -> Credentials."
        );
        console.error("   Create an OAuth 2.0 Client ID (Web Application).");
        console.error(
            '   Add "http://localhost:3000/callback" to "Authorized redirect URIs".'
        );
        console.error(
            "   Then add the ID and Secret to your .env file and run this script again."
        );
        process.exit(1);
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        REDIRECT_URI
    );

    // 2. Generate Auth URL
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline", // Critical for getting refresh_token
        scope: SCOPES,
        prompt: "consent", // Force consent to ensure refresh_token is returned
    });

    // 3. Start Local Server
    const server = http.createServer(async (req, res) => {
        if (req.url?.startsWith("/callback")) {
            const qs = new url.URL(req.url, `http://localhost:${PORT}`)
                .searchParams;
            const code = qs.get("code");

            if (code) {
                res.end(
                    "Authentication successful! You can close this window and check your terminal."
                );
                server.close();

                try {
                    console.log(
                        "\n✅ Authorization code received. Exchanging for tokens..."
                    );
                    const { tokens } = await oauth2Client.getToken(code);

                    console.log(
                        "\n=================================================="
                    );
                    console.log("   🎉 SUCCESS! Here are your credentials:");
                    console.log(
                        "=================================================="
                    );
                    console.log("\nAdd these to your .env file:\n");
                    console.log(
                        `BLOGGER_REFRESH_TOKEN=${tokens.refresh_token}`
                    );
                    console.log(
                        "\n(Your Client ID and Secret are already there)"
                    );
                    console.log(
                        "==================================================\n"
                    );
                    process.exit(0);
                } catch (err) {
                    console.error("❌ Error exchanging code for token:", err);
                    process.exit(1);
                }
            } else {
                res.end("Error: No code found in query parameters.");
            }
        } else {
            res.end(
                "Omni-Publisher Blogger Auth. Please close this and try again if you see this."
            );
        }
    });

    server.listen(PORT, () => {
        console.log(`\n1. Opening browser to: ${authUrl}`);
        console.log("2. Login with your Google account and allow access.");
        console.log("3. You will be redirected to localhost:3000/callback.");

        // Try to open browser automatically
        const start =
            process.platform == "darwin"
                ? "open"
                : process.platform == "win32"
                ? "start"
                : "xdg-open";
        exec(`${start} "${authUrl}"`);
    });
}

main().catch(console.error);
