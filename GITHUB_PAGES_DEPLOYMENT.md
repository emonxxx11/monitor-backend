# 🚀 Deploy Frontend to GitHub Pages

This guide will help you deploy your Short Link Monitor frontend to GitHub Pages.

## 📋 Prerequisites

1. **GitHub Account** - You need a GitHub account
2. **Git Repository** - Your code should be in a GitHub repository

## 🔧 Step-by-Step Deployment

### Step 1: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click "New repository"** (green button)
3. **Repository name**: `short-link-monitor-frontend`
4. **Description**: `Short Link Monitor Frontend with Analytics`
5. **Make it Public** (required for free GitHub Pages)
6. **Don't initialize** with README (we already have files)
7. **Click "Create repository"**

### Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/short-link-monitor-frontend.git

# Rename the branch to main (GitHub standard)
git branch -M main

# Push your code
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. **Go to your repository** on GitHub
2. **Click "Settings"** tab
3. **Scroll down to "Pages"** section (in the left sidebar)
4. **Under "Source"**, select **"Deploy from a branch"**
5. **Branch**: Select `main`
6. **Folder**: Select `/ (root)`
7. **Click "Save"**

### Step 4: Configure GitHub Pages

1. **Wait a few minutes** for GitHub to build your site
2. **Your site will be available at**: `https://YOUR_USERNAME.github.io/short-link-monitor-frontend/frontend.html`

## 🌐 Access Your Live Frontend

Once deployed, your frontend will be available at:
```
https://YOUR_USERNAME.github.io/short-link-monitor-frontend/frontend.html
```

## 🔗 Your Complete Setup

- **Backend**: `https://backend-monitor-4bnm.onrender.com`
- **Frontend**: `https://YOUR_USERNAME.github.io/short-link-monitor-frontend/frontend.html`
- **Short Links**: `https://backend-monitor-4bnm.onrender.com/[short-code]`

## ✅ Test Your Deployment

1. **Open your frontend URL** in a browser
2. **Create a short link** to test the connection
3. **Check analytics** to ensure everything works
4. **Share your frontend URL** with others

## 🔄 Update Your Frontend

To update your frontend after making changes:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your changes.

## 🛠️ Troubleshooting

### Common Issues

1. **Page not found (404)**:
   - Make sure you're using the correct URL with `/frontend.html`
   - Check that GitHub Pages is enabled in repository settings

2. **Backend connection issues**:
   - Verify the backend URL is correct in `frontend.html`
   - Check that your backend is running on Render.com

3. **CORS errors**:
   - The backend is already configured to allow GitHub Pages domains
   - If issues persist, check browser console for specific errors

### Check Deployment Status

1. Go to your repository on GitHub
2. Click "Actions" tab
3. Look for GitHub Pages deployment status

## 🎉 Success!

Your Short Link Monitor frontend is now live on GitHub Pages! 

### Share Your App

- **Frontend**: `https://YOUR_USERNAME.github.io/short-link-monitor-frontend/frontend.html`
- **Backend API**: `https://backend-monitor-4bnm.onrender.com`

---

**🥇 Your Short Link Monitor is now fully deployed and ready to use!** 