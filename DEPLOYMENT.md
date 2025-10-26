# 🚂 Railway Deployment Guide

## Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))

## Step-by-Step Deployment

### 1️⃣ Push to GitHub

```bash
cd /home/vitalpointai/projects/true-north
git init
git add .
git commit -m "Initial commit - True North or Not game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/true-north.git
git push -u origin main
```

### 2️⃣ Deploy on Railway

1. Go to [railway.app](https://railway.app) and login with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `true-north` repository
5. Railway will auto-detect the configuration and start building

### 3️⃣ Configure Environment Variables

1. In your Railway project, click on your service
2. Go to the **"Variables"** tab
3. Add the following environment variable:
   - **Key**: `ADMIN_PASSWORD`
   - **Value**: Your secure admin password (change from default!)

Railway will automatically set:
- `PORT` environment variable
- `NODE_ENV=production`

The app auto-configures API URLs for production.

### 4️⃣ Add Persistent Storage for Database

1. In your Railway project, click on your service
2. Go to the **"Data"** tab
3. Click **"+ New Volume"**
4. Set mount path: `/app/data`
5. Set size: `1 GB` (more than enough)
6. Click **"Add Volume"**

This ensures your SQLite database persists across deployments.

### 5️⃣ Get Your URL

1. Go to the **"Settings"** tab
2. Click **"Generate Domain"** under "Networking"
3. Your app will be live at: `https://your-app-name.up.railway.app`

## 🎉 You're Live!

Your game is now accessible worldwide! Share your Railway URL with friends.

### Features Included:
✅ Full-stack app on single service  
✅ WebSocket real-time leaderboard  
✅ SQLite database with persistence  
✅ PWA offline support  
✅ Admin panel at `/admin` (password: set via ADMIN_PASSWORD env var)  
✅ Kiosk mode at `/leaderboard?kiosk=true`

## 📊 Monitoring

- View logs in Railway dashboard
- Monitor resource usage
- Free tier: 500 hours/month + $5 credit

## 🔄 Updates

To deploy updates:
```bash
git add .
git commit -m "Your update message"
git push
```

Railway automatically redeploys on every push to main branch!

## 🆘 Troubleshooting

**Build fails?**
- Check Railway logs for error messages
- Ensure all dependencies are in `package.json`

**Database resets on deploy?**
- Make sure you added a persistent volume at `/app/data`

**WebSocket not working?**
- Railway handles WebSocket automatically, no config needed
- Check browser console for connection errors

## Alternative: Manual Deployment

If you prefer not to use GitHub:

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

---

Need help? Check [Railway Docs](https://docs.railway.app) or reach out to their Discord community!
