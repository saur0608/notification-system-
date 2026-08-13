# 🕵️‍♂️ How to find the EXACT URL causing the error

The "redirect_uri_mismatch" error is very specific. Google is telling you: *"You sent me a URL that is not in your list."*

To fix this, you need to know exactly what URL Google received.

## Step 1: Click "Error details"
On the Google error page (where it says "Access blocked"), look for a link that says **"Error details"** or **"Request Details"** on the right side or bottom.

Click it. You will see a block of text like this:

```
redirect_uri=https://meta-controller-git-main-shakti019s-projects.vercel.app/api/auth/callback/google
```

**👉 COPY THAT EXACT URL.**

## Step 2: Compare with your Google Console
1. Go back to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Open your OAuth Client.
3. Look at your **Authorized redirect URIs**.
4. **Does the URL you copied exist in the list EXACTLY?**
   - Check for `http` vs `https`.
   - Check for trailing slashes `/`.
   - Check for typos in the domain name.

## Step 3: Common Vercel URL Problems

Vercel creates **3 different URLs** for your project. You probably missed one.

1. **Production:** `https://meta-controller.vercel.app`
2. **Git Branch:** `https://meta-controller-git-main-shakti019s-projects.vercel.app`
3. **Deployment Specific:** `https://meta-controller-abc123xyz.vercel.app` (This changes every time you deploy!)

**⚠️ If you are testing on a Deployment Specific URL (the 3rd one), Google Login will NEVER work unless you add that specific random URL to Google Console.**

**Solution:**
Always test your app using the **Production URL** (`https://meta-controller.vercel.app`) or the **Git Branch URL** that you already added. Do not use the random deployment URLs.

## Step 4: Check Vercel Environment Variables

1. Go to your Vercel Project Settings > **Environment Variables**.
2. Check `NEXTAUTH_URL`.
   - It should be: `https://meta-controller.vercel.app`
   - If it is set to `http://localhost:3000`, **CHANGE IT**.

## Step 5: Redeploy
If you changed Environment Variables in Vercel, you **MUST REDEPLOY** for them to take effect.
- Go to Deployments.
- Click the three dots on the latest deployment.
- Click **Redeploy**.
