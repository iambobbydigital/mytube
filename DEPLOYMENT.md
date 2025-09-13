# MyTube Deployment Guide

This guide covers deploying MyTube to Vercel with proper OAuth configuration.

## 🚀 Quick Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub Integration

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add OAuth setup and deployment config"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and configure build settings

## ⚙️ Environment Variables Setup

### Required Environment Variables for Vercel

In your Vercel project dashboard, go to Settings → Environment Variables and add:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration (generate a new secret for production)
NEXTAUTH_SECRET=your_production_nextauth_secret_here
# NEXTAUTH_URL is auto-set by Vercel, don't add manually

# YouTube API Key
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### Generate Production Secret

Run this locally and use the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔧 Post-Deployment Configuration

### 1. Update Google OAuth Settings

After your first deployment:

1. **Get your Vercel URL** from the deployment dashboard
2. **Go to Google Cloud Console** → APIs & Services → Credentials
3. **Edit your OAuth 2.0 Client ID**
4. **Add these Authorized Redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   https://your-app-name-git-main-your-username.vercel.app/api/auth/callback/google
   ```

### 2. Update OAuth Consent Screen

1. **Go to OAuth consent screen** in Google Cloud Console
2. **Update app domains**:
   - Homepage: `https://your-app-name.vercel.app`
   - Privacy Policy: `https://your-app-name.vercel.app/privacy`
   - Terms of Service: `https://your-app-name.vercel.app/terms`

### 3. Test Production Deployment

1. Visit your deployed app
2. Test the OAuth flow
3. Verify YouTube data access works
4. Check error handling

## 🔒 Security Considerations

### Production Security Checklist

- [ ] Use different Google OAuth credentials for production
- [ ] Generate a new `NEXTAUTH_SECRET` for production
- [ ] Enable HTTPS only (Vercel does this by default)
- [ ] Restrict API keys to specific domains
- [ ] Monitor API usage and quotas
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

### API Key Restrictions

1. **In Google Cloud Console**, edit your YouTube API key
2. **Add HTTP referrers**:
   ```
   https://your-app-name.vercel.app/*
   https://your-custom-domain.com/*
   ```

## 🌐 Custom Domain Setup

### 1. Add Custom Domain in Vercel

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Configure DNS as instructed by Vercel

### 2. Update OAuth Configuration

1. **Add custom domain to Google OAuth**:
   ```
   https://your-custom-domain.com/api/auth/callback/google
   ```

2. **Update OAuth consent screen** with custom domain URLs

### 3. Update Environment Variables

If using a custom domain, you may want to set:
```bash
NEXTAUTH_URL=https://your-custom-domain.com
```

## 📊 Monitoring and Analytics

### Vercel Analytics

1. **Enable Vercel Analytics** in your project settings
2. **Monitor performance** and usage metrics
3. **Set up alerts** for errors and downtime

### Error Tracking

Consider adding error tracking:

```bash
npm install @sentry/nextjs
```

Then configure in `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig({
  // Your Next.js config
}, {
  // Sentry config
})
```

## 🚨 Troubleshooting Deployment Issues

### Common Deployment Problems

1. **Build failures**
   - Check for TypeScript errors locally
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **OAuth redirect issues**
   - Verify redirect URIs match exactly
   - Check for trailing slashes
   - Ensure HTTPS in production URLs

3. **Environment variable issues**
   - Check variable names are correct
   - Ensure no extra spaces or quotes
   - Verify sensitive values are not in git

4. **API quota exceeded**
   - Monitor Google Cloud Console quotas
   - Implement caching for API responses
   - Consider request deduplication

### Debug Production Issues

1. **Check Vercel Function Logs**
   ```bash
   vercel logs your-deployment-url
   ```

2. **Enable Debug Logging**
   - Add `debug: true` to NextAuth config for production temporarily
   - Check browser console for client-side errors
   - Monitor Network tab for failed requests

3. **Test Locally with Production Config**
   ```bash
   NODE_ENV=production npm run dev
   ```

## 🔄 CI/CD Pipeline

### Automatic Deployments

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: When you push to other branches or open PRs

### Branch Protection

Consider setting up:
```bash
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

## 📈 Performance Optimization

### Vercel-Specific Optimizations

1. **Enable Edge Functions** for auth endpoints
2. **Use Vercel KV** for session storage (optional)
3. **Enable Image Optimization** for YouTube thumbnails
4. **Configure caching headers** for static assets

### Code Splitting

Ensure proper code splitting:
```javascript
// Dynamic imports for heavy components
const VideoPlayer = dynamic(() => import('../components/VideoPlayer'), {
  loading: () => <div>Loading player...</div>
})
```

## 🔧 Environment-Specific Features

### Preview Deployments

- Test OAuth with preview URLs
- Use different Google OAuth client for preview
- Enable debug logging for preview environments

### Production Features

- Disable debug logging
- Enable error tracking
- Set up monitoring alerts
- Configure caching strategies

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
- [Google OAuth Best Practices](https://developers.google.com/identity/protocols/oauth2/security-best-practices)

## 🆘 Getting Help

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables
3. Test OAuth flow locally first
4. Check Google Cloud Console for API errors
5. Review this deployment guide
6. Create an issue with deployment details