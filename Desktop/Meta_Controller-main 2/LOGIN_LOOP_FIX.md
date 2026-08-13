# 🔄 Fixing the "Loop Back to Login" Issue

If you sign in with Google, and it just sends you back to the login page without logging you in, it is usually one of these 3 problems.

## 1. Check `NEXTAUTH_URL` in Vercel (Most Likely!)

If you copied your `.env.local` to Vercel, you might have set `NEXTAUTH_URL` to `http://localhost:3000`. **This breaks the login on the live site.**

1. Go to Vercel Dashboard > Project > Settings > **Environment Variables**.
2. Find `NEXTAUTH_URL`.
3. **It must be:** `https://meta-controller.vercel.app` (or your custom domain).
   - ❌ `http://localhost:3000` -> **WRONG**
   - ❌ `https://meta-controller.vercel.app/` (Trailing slash) -> **WRONG**
   - ✅ `https://meta-controller.vercel.app` -> **CORRECT**

## 2. Check `NEXTAUTH_SECRET`

You must have a secret key set in Vercel.

1. In Vercel Environment Variables, check if `NEXTAUTH_SECRET` exists.
2. If not, add it. You can use any random string (e.g., `my-super-secret-key-123`).

## 3. Check MongoDB Connection

If the app cannot connect to the database, it cannot create your user, so it kicks you out.

1. In Vercel, check `MONGODB_URI`.
2. Ensure you have allowed access from **Anywhere (0.0.0.0/0)** in your MongoDB Atlas Network Access settings. Vercel servers change IPs constantly, so you cannot whitelist a specific IP.

## 🛠️ How to verify what is wrong?

1. Go to your Vercel Dashboard.
2. Click on the **Logs** tab.
3. Try to sign in again on your app.
4. Look at the logs.
   - If you see `MongoTimeoutError`, it's the database.
   - If you see `[next-auth][error][SIGNIN_OAUTH_ERROR]`, it's the OAuth setup.

## ⚡ ACTION PLAN
1. **Update `NEXTAUTH_URL`** in Vercel to `https://meta-controller.vercel.app`.
2. **Redeploy** your app (Deployments > Redeploy) to make sure the changes take effect.
