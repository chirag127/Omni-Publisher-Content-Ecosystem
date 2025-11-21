# How to Create a Google OAuth 2.0 Client ID for Blogger

Follow these steps to generate the `Client ID` and `Client Secret` needed for Omni-Publisher.

## 1. Create a Project

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click the project dropdown at the top left.
3.  Click **New Project**.
4.  Name it `Omni-Publisher` and click **Create**.
5.  Select the new project.

## 2. Enable the Blogger API

1.  In the left sidebar, go to **APIs & Services** > **Library**.
2.  Search for `Blogger API v3`.
3.  Click on it and click **Enable**.

## 3. Configure OAuth Consent Screen

1.  In the left sidebar, go to **APIs & Services** > **OAuth consent screen**.
2.  Choose **External** (since you don't have a Google Workspace organization) and click **Create**.
3.  **App Information**:
    -   **App name**: `Omni-Publisher`
    -   **User support email**: Select your email.
4.  **Developer contact information**: Enter your email.
5.  Click **Save and Continue** through the "Scopes" and "Test Users" sections (you can leave them default/empty for now, or add your own email as a test user if prompted).
6.  **Important**: If your app is in "Testing" mode, you **must** add your email address to the **Test users** list in the OAuth consent screen settings, otherwise login will fail with "Access Blocked".

## 4. Create Credentials

1.  In the left sidebar, go to **APIs & Services** > **Credentials**.
2.  Click **+ CREATE CREDENTIALS** at the top.
3.  Select **OAuth client ID**.
4.  **Application type**: Select **Web application**.
5.  **Name**: `Omni-Publisher Local`.
6.  **Authorized redirect URIs**:
    -   Click **+ ADD URI**.
    -   Enter: `http://localhost:3000/callback`
    -   _(Note: This must match exactly what is in the script)_.
7.  Click **Create**.

## 5. Copy Your Keys

1.  A popup will appear with your credentials.
2.  Copy the **Client ID**.
3.  Copy the **Client Secret**.
4.  Paste them into your `.env` file:

```env
BLOGGER_CLIENT_ID=your_pasted_client_id
BLOGGER_CLIENT_SECRET=your_pasted_client_secret
```

## 6. Generate Refresh Token

Now you can run the script:

```bash
npx tsx scripts/get-blogger-token.ts
```
