# Google OAuth Setup Guide

## Setting up Google OAuth for MetaController

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "MetaController" or similar

### Step 2: Enable Google+ API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click **Enable**

### Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type
3. Fill in required fields:
   - **App name**: MetaController
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Click **Save and Continue**
5. Skip **Scopes** (default is fine)
6. Add test users if needed (for development)
7. Click **Save and Continue**

### Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. Select **Web application**
4. Fill in:
   - **Name**: MetaController Web Client
   - **Authorized JavaScript origins**:
     - http://localhost:3000
     - https://your-domain.vercel.app (for production)
   - **Authorized redirect URIs**:
     - http://localhost:3000/api/auth/callback/google
     - https://your-domain.vercel.app/api/auth/callback/google
5. Click **Create**
6. Copy **Client ID** and **Client Secret**

### Step 5: Add to Environment Variables

Create `.env.local` file:

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key

# Copy from Google Cloud Console
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### Step 6: Generate NEXTAUTH_SECRET

Run in PowerShell:

```powershell
# Generate random secret
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Or use: https://generate-secret.vercel.app/32

### Step 7: Test Authentication

1. Start dev server: `npm run dev`
2. Navigate to: http://localhost:3000/auth/signin
3. Click "Continue with Google"
4. Sign in with Google account
5. You should be redirected to `/machines`

### Production Deployment (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `NEXTAUTH_URL` = https://your-domain.vercel.app
   - `NEXTAUTH_SECRET` = (your generated secret)
   - `GOOGLE_CLIENT_ID` = (from Google Console)
   - `GOOGLE_CLIENT_SECRET` = (from Google Console)
4. Redeploy your application

### Troubleshooting

**Error: redirect_uri_mismatch**
- Ensure redirect URI in Google Console matches exactly
- Check for http vs https
- Include `/api/auth/callback/google` path

**Error: Access blocked**
- Add your email to test users in OAuth consent screen
- Or publish the app (for production)

**Session not persisting**
- Check `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Restart dev server

### Security Notes

⚠️ **Important:**
- Never commit `.env.local` to version control
- Use different secrets for dev/production
- Rotate secrets periodically
- Add `.env.local` to `.gitignore`

### Role Assignment

By default, users are assigned roles based on email:
- Contains "admin" → Admin role
- Contains "engineer" → Engineer role
- Contains "operator" → Operator role
- Others → Viewer role

To customize, edit `lib/auth.ts` > `createUser` function.
