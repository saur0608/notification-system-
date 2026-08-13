# Fixing "Error 400: redirect_uri_mismatch" on Vercel

This error happens because Google doesn't recognize your Vercel deployment URL as a safe place to send users back to after they log in. You need to tell Google about your Vercel URL.

## Step 1: Find your Vercel URL

1. Go to your Vercel Dashboard.
2. Open your project.
3. Look for the **Domains** section or the **Production Deployment** link.
4. Copy your production domain (e.g., `https://your-project-name.vercel.app`).

## Step 2: Update Google Cloud Console

1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Find your **OAuth 2.0 Client ID** (the one you created for this app) and click the pencil icon to edit it.
3. Scroll down to the **Authorized redirect URIs** section.
4. Click **ADD URI**.
5. Paste your Vercel URL and add `/api/auth/callback/google` to the end.

   **Example:**
   If your Vercel URL is `https://industrial-machine-platform.vercel.app`, you must add:
   ```
   https://industrial-machine-platform.vercel.app/api/auth/callback/google
   ```

   **Important:**
   - It must be `https`.
   - It must have the exact path `/api/auth/callback/google`.
   - No trailing slash at the end.

6. (Optional) If you are testing on a Vercel Preview URL (e.g., `https://project-git-branch-user.vercel.app`), you must add that specific URL as well.

7. Click **SAVE**.

## Step 3: Update Environment Variables on Vercel

1. Go to your Vercel Project Settings > **Environment Variables**.
2. Ensure you have added:
   - `GOOGLE_CLIENT_ID`: (Your Google Client ID)
   - `GOOGLE_CLIENT_SECRET`: (Your Google Client Secret)
   - `NEXTAUTH_URL`: Set this to your production URL (e.g., `https://your-project-name.vercel.app`).
   - `NEXTAUTH_SECRET`: (A random string for security).

3. If you changed any environment variables, you must **Redeploy** your application for them to take effect.

## Step 4: Wait a few minutes

Google's changes can take a few minutes (sometimes up to 5 minutes) to propagate. After waiting, try signing in again.
