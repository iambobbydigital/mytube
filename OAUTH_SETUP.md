# Google OAuth Setup Guide for MyTube

This guide will walk you through setting up Google OAuth for MyTube, enabling users to sign in with their Google accounts and access their YouTube subscriptions.

## 📋 Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Basic understanding of OAuth 2.0

## 🚀 Step-by-Step Setup

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click the project dropdown at the top
   - Click "New Project"
   - Enter project name: `MyTube` (or your preferred name)
   - Note the Project ID for reference
   - Click "Create"

3. **Select Your Project**
   - Make sure your new project is selected in the project dropdown

### Step 2: Enable Required APIs

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services" → "Library"

2. **Enable YouTube Data API v3**
   - Search for "YouTube Data API v3"
   - Click on it and click "Enable"
   - Wait for the API to be enabled

3. **Enable Google+ API** (for profile access)
   - Search for "Google+ API"
   - Click on it and click "Enable"
   - Wait for the API to be enabled

### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - In the left sidebar, click "APIs & Services" → "OAuth consent screen"

2. **Choose User Type**
   - Select "External" (for public use)
   - Click "Create"

3. **Fill OAuth Consent Screen Information**
   - **App name**: `MyTube`
   - **User support email**: Your email address
   - **App logo**: (Optional) Upload your app logo
   - **App domain**: 
     - Homepage: `http://localhost:3001` (for development)
     - Privacy policy: `http://localhost:3001/privacy` (create this page)
     - Terms of service: `http://localhost:3001/terms` (create this page)
   - **Developer contact information**: Your email address
   - Click "Save and Continue"

4. **Add Scopes**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `openid`
     - `email`
     - `profile`
     - `https://www.googleapis.com/auth/youtube.readonly`
   - Click "Update" then "Save and Continue"

5. **Add Test Users** (for development)
   - Add your Google email and any other test users
   - Click "Save and Continue"

6. **Review and Submit**
   - Review your settings
   - Click "Back to Dashboard"

### Step 4: Create OAuth 2.0 Credentials

1. **Navigate to Credentials**
   - Click "APIs & Services" → "Credentials"

2. **Create OAuth 2.0 Client ID**
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: `MyTube Web Client`

3. **Configure Authorized Redirect URIs**
   
   **For Local Development:**
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3001/api/auth/callback/google
   http://127.0.0.1:3000/api/auth/callback/google
   http://127.0.0.1:3001/api/auth/callback/google
   ```

   **For Vercel Deployment (add these when deploying):**
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   https://your-app-name-git-main-username.vercel.app/api/auth/callback/google
   https://your-custom-domain.com/api/auth/callback/google
   ```

4. **Save Credentials**
   - Click "Create"
   - **Important**: Copy the Client ID and Client Secret
   - Keep these secure and never commit them to version control

### Step 5: Create YouTube API Key

1. **Create API Key**
   - In Credentials page, click "Create Credentials" → "API Key"
   - Copy the API key

2. **Restrict the API Key** (Recommended for security)
   - Click the pencil icon next to your API key
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "Save"

### Step 6: Configure Environment Variables

1. **Copy the example environment file**
   ```bash
   cp .env.example .env.local
   ```

2. **Update .env.local with your credentials**
   ```bash
   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here

   # NextAuth Configuration
   NEXTAUTH_SECRET=your_generated_secret_here
   NEXTAUTH_URL=http://localhost:3001

   # YouTube API Key
   YOUTUBE_API_KEY=your_actual_youtube_api_key_here
   ```

3. **Generate NEXTAUTH_SECRET**
   ```bash
   # Run this command to generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

### Step 7: Test Local Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Test the OAuth flow**
   - Go to `http://localhost:3001`
   - Click "Sign in with Google"
   - Complete the OAuth flow
   - Verify you can access your YouTube subscriptions

## 🚀 Vercel Deployment Setup

### Step 1: Deploy to Vercel

1. **Connect your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure environment variables in Vercel**
   - In your Vercel project settings, go to "Environment Variables"
   - Add all the variables from your `.env.local`:
     - `GOOGLE_CLIENT_ID`
     - `GOOGLE_CLIENT_SECRET`
     - `NEXTAUTH_SECRET` (generate a new one for production)
     - `YOUTUBE_API_KEY`
   - **Do not set NEXTAUTH_URL** - Vercel will auto-detect this

### Step 2: Update OAuth Redirect URIs

1. **Get your Vercel deployment URL**
   - After deployment, note your Vercel app URL (e.g., `https://mytube-abc123.vercel.app`)

2. **Add production redirect URIs**
   - Go back to Google Cloud Console → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add these URLs to "Authorized redirect URIs":
     ```
     https://your-vercel-url.vercel.app/api/auth/callback/google
     https://your-custom-domain.com/api/auth/callback/google
     ```

### Step 3: Update OAuth Consent Screen for Production

1. **Update app domains**
   - Go to OAuth consent screen
   - Update the homepage URL to your production domain
   - Update privacy policy and terms of service URLs

2. **Publish the app** (when ready for public use)
   - Submit for verification if you want to remove the "unverified app" warning
   - Or keep it in testing mode for limited users

## 🔧 Troubleshooting

### Common Issues

1. **"Error 401: invalid_client"**
   - Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
   - Verify the redirect URI matches exactly (including protocol and port)

2. **"Access denied" errors**
   - Make sure YouTube Data API v3 is enabled
   - Check that the OAuth consent screen is properly configured
   - Verify your Google account has access to YouTube

3. **"Redirect URI mismatch"**
   - Ensure the redirect URI in Google Cloud Console matches your app's URL exactly
   - Check for trailing slashes and case sensitivity

4. **Token refresh errors**
   - Make sure you're requesting `offline` access type
   - Verify refresh token is being stored properly

### Development Tips

1. **Use different projects for development and production**
2. **Enable detailed logging in development** (set `debug: true` in NextAuth config)
3. **Test with multiple Google accounts**
4. **Monitor your API quotas** in Google Cloud Console

## 🔒 Security Best Practices

1. **Never commit secrets to version control**
2. **Use different credentials for development and production**
3. **Regularly rotate your API keys and secrets**
4. **Restrict API keys to specific APIs**
5. **Monitor your API usage in Google Cloud Console**
6. **Use HTTPS in production**
7. **Implement proper CORS policies**

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Check the server logs (in Vercel dashboard or local terminal)
3. Verify all environment variables are set correctly
4. Ensure all APIs are enabled in Google Cloud Console
5. Check the OAuth consent screen configuration

For additional help, create an issue in the project repository with:
- Error messages
- Steps to reproduce
- Environment (local/production)
- Browser and version