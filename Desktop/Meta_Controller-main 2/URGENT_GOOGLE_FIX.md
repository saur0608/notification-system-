# 🚨 FOUND THE EXACT MISSING URL

I decoded the error message you sent. Google is rejecting this **EXACT** URL:

```
https://meta-controller-git-main-shakti019s-projects.vercel.app/api/auth/callback/google
```

You are currently using the "Git Branch" version of your app, but you haven't added this specific URL to your Google Console's **Redirect URIs**.

## 🛠️ THE FIX

1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Open your OAuth Client.
3. Scroll down to **Authorized redirect URIs**.
4. Click **ADD URI**.
5. Paste this **EXACT** line:
   ```
   https://meta-controller-git-main-shakti019s-projects.vercel.app/api/auth/callback/google
   ```
6. Click **SAVE**.
7. Wait 5 minutes.
8. Try logging in again.
