# 🚀 Fixing Google Auth on Vercel Deployment

The error `Error 400: redirect_uri_mismatch` happens because Google only trusts specific URLs that you have explicitly whitelisted. When you deploy to Vercel, your URL changes from `localhost:3000` to `https://your-project.vercel.app`, and Google blocks it for security.

## ✅ Step 1: Get Your Vercel URL
1. Go to your Vercel Dashboard.
2. Open your project.
3. Copy the **Domain** (e.g., `https://metacontroller-xyz.vercel.app`).

## ✅ Step 2: Update Google Cloud Console
1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. Click on your **OAuth 2.0 Client ID** (e.g., "Web client 1").
3. Scroll down to **Authorized JavaScript origins**.
   - Click **ADD URI**.
   - Paste your Vercel URL: `https://your-project.vercel.app` (No trailing slash).
4. Scroll down to **Authorized redirect URIs**.
   - Click **ADD URI**.
   - Paste your Vercel Callback URL: `https://your-project.vercel.app/api/auth/callback/google`
   - **Important:** It must end exactly with `/api/auth/callback/google`.
5. Click **SAVE**.

## ✅ Step 3: Update Vercel Environment Variables
1. Go to your Vercel Project > **Settings** > **Environment Variables**.
2. Add or Update the following variables:
   - `NEXTAUTH_URL`: Set this to your Vercel URL (e.g., `https://your-project.vercel.app`).
   - `GOOGLE_CLIENT_ID`: Ensure this matches your local `.env`.
   - `GOOGLE_CLIENT_SECRET`: Ensure this matches your local `.env`.
3. **Redeploy** your application (or go to Deployments > Redeploy) for changes to take effect.

## ⏳ Wait a few minutes
Google's changes can take 5-10 minutes to propagate. If it doesn't work immediately, wait a bit and try again.
