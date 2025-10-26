# Railway Volume Setup via CLI

If you can't find the volume option in the UI, use the Railway CLI:

## 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

## 2. Login to Railway

```bash
railway login
```

## 3. Link to your project

```bash
cd /home/vitalpointai/projects/true-north
railway link
```

Select your true-north project when prompted.

## 4. Add volume

```bash
railway volume add --mount-path /app/data --name database
```

## 5. Verify

Your next deployment will include the persistent volume at `/app/data`.

---

## Current Railway UI (as of Oct 2025)

The volume option is typically found:
- **Service → Settings → Volumes** (scroll down)
- Or **Service → Variables** tab may have a "Volumes" link
- Or look for a "Storage" icon/tab in the service view

The exact location varies by Railway version, but the mount path should always be: `/app/data`
