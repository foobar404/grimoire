# 🚀 Deployment Guide for EPUB Creator

This guide will help you deploy the EPUB Creator app to GitHub Pages with automatic building and deployment.

## 📋 Prerequisites

- GitHub account
- Git installed on your local machine
- Node.js 18+ installed locally (for testing)

## 🔧 Setup Steps

### 1. Fork or Clone the Repository

**Option A: Fork (Recommended)**
1. Click the "Fork" button on the GitHub repository
2. Clone your fork to your local machine:
   ```bash
   git clone https://github.com/YOURUSERNAME/epub-creator.git
   cd epub-creator
   ```

**Option B: Download and Create New Repository**
1. Download the source code
2. Create a new repository on GitHub
3. Push the code to your new repository

### 2. Update Configuration

Update the following files with your information:

**vite.config.js**
```javascript
base: process.env.NODE_ENV === 'production' ? '/YOUR-REPO-NAME/' : '/',
```

**package.json**
```json
{
  "homepage": "https://YOURUSERNAME.github.io/YOUR-REPO-NAME",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOURUSERNAME/YOUR-REPO-NAME.git"
  },
  "author": "Your Name"
}
```

**README.md**
- Replace `yourusername` with your GitHub username
- Replace `epub-creator` with your repository name

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### 4. Deploy

1. **Commit and Push** your changes:
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages deployment"
   git push origin main
   ```

2. **Check the Action**: Go to the **Actions** tab in your repository to see the build process

3. **Access Your App**: Once the action completes, your app will be available at:
   ```
   https://YOURUSERNAME.github.io/YOUR-REPO-NAME
   ```

## 🔄 Automatic Deployment

The GitHub Action will automatically:
- **Build** the project whenever you push to the `main` branch
- **Deploy** the built files to GitHub Pages
- **Update** your live site within a few minutes

## 🛠️ Local Development

To test locally before deploying:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (test the build)
npm run build

# Preview the production build
npm run preview
```

## 📱 Custom Domain (Optional)

To use a custom domain:

1. **Add a CNAME file** in the `public/` directory with your domain
2. **Configure DNS** to point to `YOURUSERNAME.github.io`
3. **Update GitHub Pages settings** to use your custom domain

## 🐛 Troubleshooting

### Build Fails
- Check the Actions tab for error details
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### App Doesn't Load
- Check that the `base` path in vite.config.js matches your repository name
- Ensure GitHub Pages is enabled with "GitHub Actions" source
- Wait a few minutes for DNS propagation

### Routing Issues
- This is a single-page app, so routing should work automatically
- Check browser console for any JavaScript errors

## 📧 Support

If you encounter issues:
1. Check the [GitHub Actions logs](https://github.com/YOURUSERNAME/YOUR-REPO-NAME/actions)
2. Verify all configuration files are updated correctly
3. Ensure your repository is public (or you have GitHub Pro for private Pages)

## 🎉 You're Done!

Your EPUB Creator app should now be live and automatically updating whenever you push changes to the main branch. Share the link with others to let them create their own ebooks!
