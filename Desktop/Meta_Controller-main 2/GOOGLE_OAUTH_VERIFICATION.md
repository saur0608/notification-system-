# 🛑 STOP AND CHECK THESE 3 THINGS

The error is **STILL** saying that Google does not know about this URL:
`https://meta-controller-git-main-shakti019s-projects.vercel.app/api/auth/callback/google`

If you think you added it, please check these common mistakes:

## 1. Check for Typos (Very Common!)
Look at the URL you added in Google Console.
- Did you accidentally add a space at the beginning or end?
- Did you type `http` instead of `https`?
- Did you miss the `/api/auth/callback/google` part at the end?
- Did you miss the `-git-main-` part in the middle?

**It must match this EXACTLY (Copy and Paste this):**
```
https://meta-controller-git-main-shakti019s-projects.vercel.app/api/auth/callback/google
```

## 2. Did you click SAVE?
After adding the URI, you must click the blue **SAVE** button at the bottom of the screen. If you just typed it in and closed the tab, it wasn't saved.

## 3. Are you editing the correct Client ID?
Your error message says your Client ID is:
`1020463452031-fekomab73gs54accfnemdpefkiqe6io4.apps.googleusercontent.com`

Please verify that the OAuth Client you are editing in Google Cloud Console has this **EXACT** Client ID at the top. If you have multiple clients, you might be editing the wrong one.

## 4. It takes time!
Google says: *"Note: It may take 5 minutes to a few hours for settings to take effect"*
If you are 100% sure you added it correctly, **wait 15 minutes** and try again.
