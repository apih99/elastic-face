# 🚀 GitHub Pages Deployment Guide

This guide will walk you through deploying the Elastic Face app to GitHub Pages using GitHub Actions.

## 📋 Prerequisites

- GitHub account
- Git installed on your computer
- Node.js (version 14+) installed locally

## 🔧 Setup Steps

### 1. Repository Setup

1. **Fork this repository** or create a new repository with this code
2. **Clone your repository** locally:
   ```bash
   git clone https://github.com/[YOUR-USERNAME]/elastic-face.git
   cd elastic-face
   ```

### 2. Update Configuration

1. **Edit `package.json`** and update the homepage URL:
   ```json
   "homepage": "https://[YOUR-USERNAME].github.io/elastic-face"
   ```
   Replace `[YOUR-USERNAME]` with your actual GitHub username.

2. **Commit the changes**:
   ```bash
   git add package.json
   git commit -m "Update homepage for GitHub Pages deployment"
   git push origin main
   ```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### 4. Deploy

The deployment will happen automatically when you:
- Push to the `main` branch
- Create a pull request to `main`

The GitHub Action will:
1. ✅ Install dependencies
2. ✅ Build the React app
3. ✅ Deploy to GitHub Pages
4. ✅ Make your site live

## 🌐 Accessing Your Site

Once deployed, your site will be available at:
```
https://[YOUR-USERNAME].github.io/elastic-face
```

## 🔍 Monitoring Deployment

1. Go to the **Actions** tab in your repository
2. You'll see the deployment workflow running
3. Click on any workflow run to see detailed logs
4. Green checkmark = successful deployment
5. Red X = deployment failed (check logs for errors)

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. **404 Page Not Found**
- **Cause**: Incorrect homepage URL in package.json
- **Solution**: Double-check the URL format and your username

#### 2. **Build Fails**
- **Cause**: Missing dependencies or syntax errors
- **Solution**: Run `npm install` and `npm run build` locally to test

#### 3. **Permission Denied**
- **Cause**: GitHub Pages not properly enabled
- **Solution**: Ensure "GitHub Actions" is selected as the source in Pages settings

#### 4. **Old Version Showing**
- **Cause**: Browser cache or deployment delay
- **Solution**: Hard refresh (Ctrl+F5) or wait a few minutes

### Manual Deployment (Alternative)

If GitHub Actions aren't working, you can deploy manually:

1. **Install gh-pages** (if not already installed):
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   npm run deploy
   ```

## 📝 Workflow Details

The GitHub Action (`.github/workflows/deploy.yml`) does the following:

```yaml
# Triggers on push to main branch
on:
  push:
    branches: [ main ]

# Jobs:
1. Build - Installs dependencies and builds the app
2. Deploy - Uploads build files to GitHub Pages
```

## 🔄 Updating Your Site

To update your deployed site:

1. Make changes to your code
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin main
   ```
3. GitHub Action will automatically rebuild and deploy

## 🎯 Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` directory
2. Add your domain to the file (e.g., `mydomain.com`)
3. Configure DNS settings with your domain provider
4. Update the homepage in package.json to your custom domain

## 💡 Tips

- **Test locally first**: Always run `npm start` and `npm run build` locally
- **Check console errors**: Use browser dev tools to debug issues
- **Monitor workflow**: Watch the Actions tab for deployment status
- **Keep dependencies updated**: Regularly update packages for security

## 📞 Need Help?

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

Happy deploying! 🎉 Your elastic face will be live on the internet soon! 