# Cloudflare Pages Deployment Setup

Complete setup guide for deploying ZETRAXUS to Cloudflare Pages with Node.js runtime.

---

## Prerequisites

✅ Project already configured:
- `wrangler.toml` removed (Pages auto-detection enabled)
- `next.config.ts` optimized for Node.js runtime
- GitHub repository connected

---

## Cloudflare Pages Configuration

### Step 1: Connect GitHub Repository

1. Go to **Cloudflare Dashboard** → **Pages**
2. Click **Connect to Git**
3. Select **GitHub**
4. Authorize Cloudflare to access your GitHub
5. Select repository: `ZETRAXUSS/ZETRAXUS-WEBSITE`
6. Click **Begin setup**

### Step 2: Configure Build Settings

On the "Set up builds and deployments" page:

| Setting | Value |
|---------|-------|
| **Framework preset** | Next.js |
| **Build command** | `npm run build` |
| **Build output directory** | (Leave empty - auto-detected) |
| **Root directory** | `/` |
| **Node.js version** | 24.x (or latest) |

### Step 3: Set Environment Variables

Click **Environment variables** (or configure later):

**Production Variables:**
```
NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = your-supabase-key
```

These are **PUBLIC** variables (safe to expose in browser).

**Optional - Advanced (if needed):**
If you have private/secret variables later, add them under "Secrets".

### Step 4: Custom Domain (zetraxus.com)

1. After first deployment succeeds, go to **Pages project**
2. Go to **Settings** → **Custom domains**
3. Click **Add custom domain**
4. Enter: `zetraxus.com`
5. Follow DNS setup instructions

**DNS Configuration:**
Add CNAME record to your domain registrar:
```
Name: zetraxus.com (or subdomain)
Type: CNAME
Value: zetraxus-website.pages.dev
```

Wait 5-15 minutes for DNS propagation.

---

## Deployment Process

### Automatic Deployment

✅ **Every push to `main` branch:**
1. GitHub webhook triggers Cloudflare
2. Cloudflare Pages clones repository
3. Detects Next.js framework
4. Runs `npm run build`
5. Starts Node.js server
6. Deploys to zetraxus.com

### Manual Redeploy

To trigger redeploy without code changes:
1. Cloudflare Pages → Your project
2. Click the latest deployment
3. Click **Redeploy** button

### View Build Logs

1. Cloudflare Pages → Your project
2. Click on a deployment
3. Click **View build log**
4. See real-time logs

---

## Build Stages (Expected Output)

### Stage 1: Clone Repository ✅
```
Cloning repository...
Restoring from dependencies cache
```

### Stage 2: Install Dependencies ✅
```
npm clean-install --progress=false
added 379 packages in ~11s
```

### Stage 3: Build Next.js ✅
```
npm run build
> next build
▲ Next.js 16.3.5
✓ Compiled successfully in 9.3s
✓ Generating static pages... (12/12)
```

### Stage 4: TypeScript Check ✅
```
Running TypeScript ...
Finished TypeScript in 2.8s
```

### Stage 5: Deploy ✅
```
Success: Build command completed
Deployment complete
```

---

## Troubleshooting

### Build Fails: "Missing entry-point to Worker script"

**Problem:** 
```
✘ [ERROR] Missing entry-point to Worker script or to assets directory
```

**Solution:**
- Make sure `wrangler.toml` is **deleted** ✅ (already done)
- Framework preset is set to **Next.js** (not Workers)

### Build Fails: "TypeScript errors"

**Problem:**
```
error TS2339: Property 'icon' does not exist
error TS18047: 'profile' is possibly 'null'
```

**Solution:**
- These should be fixed in commit `e6475f2`
- If still failing, pull latest from `main` branch
- Commit `9fb97d9` has final fixes

### Deploy Fails: "Cannot start server"

**Problem:**
Build succeeds but deployment fails when starting server.

**Solution:**
1. Check environment variables are set correctly
2. Verify `NEXT_PUBLIC_SUPABASE_URL` and key are correct
3. Check Supabase project is accessible
4. View build log for specific error

### Site Shows 404

**Problem:**
Site deploys but all routes show 404.

**Solution:**
1. Wait 2-3 minutes for full deployment
2. Clear browser cache (Ctrl+Shift+Delete)
3. Try direct URL: `https://zetraxus-website.pages.dev`
4. Check Cloudflare DNS settings

---

## Runtime Features

✅ **Enabled with Node.js Runtime:**
- Server-side rendering (SSR)
- API routes (if needed)
- Database queries
- Authentication
- Dynamic routes (/profile, /forum, etc.)

---

## Performance Optimization

### Caching

Cloudflare Pages automatically caches:
- Static assets (CSS, JS, images)
- HTML pages (with cache headers)

### Build Cache

Enable for faster rebuilds:
1. **Settings** → **Build cache**
2. Toggle: **Cache build dependencies**
3. Saves npm install time

---

## Monitoring & Analytics

### View Deployments

1. Cloudflare Pages → Your project
2. See all deployments with timestamps
3. Click deployment to see:
   - Build logs
   - Deployment status
   - Production URL
   - Commit hash

### Analytics

1. **Settings** → **Analytics**
2. View:
   - Page views
   - Bandwidth usage
   - Countries
   - Error rates

---

## Rollback to Previous Deployment

If latest deployment has issues:

1. Cloudflare Pages → Your project
2. Find previous working deployment
3. Click **Redeploy** button
4. Instantly reverts to that version

---

## Secrets Management

### Never Expose:
❌ `.env.local` files (already gitignored)
❌ Supabase service role key
❌ Database passwords
❌ Private API keys

### Safe to Expose:
✅ `NEXT_PUBLIC_SUPABASE_URL` (public URL)
✅ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (public key)

---

## Environment Variables Explained

### `NEXT_PUBLIC_SUPABASE_URL`
- **Type:** Public
- **Value:** `https://your-project.supabase.co`
- **Used by:** Browser (client-side)
- **Visible in:** Frontend code

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- **Type:** Public
- **Value:** Long string starting with `eyJhbGc...`
- **Used by:** Browser (client-side)
- **Visible in:** Frontend code
- **Safe:** Only allows public Supabase operations

### NOT Set in Cloudflare (server-side only):
- Service role key (server-only)
- Database passwords (server-only)
- Admin tokens (server-only)

---

## Deployment Checklist

Before first deployment:

- [ ] GitHub repository connected
- [ ] Build command: `npm run build`
- [ ] Framework: Next.js (auto-detected)
- [ ] Node.js version: 24.x or latest
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in env vars
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` set in env vars
- [ ] `wrangler.toml` deleted (removed)
- [ ] `next.config.ts` optimized
- [ ] No `.env.local` or secrets committed

After first deployment:

- [ ] Build successful (green checkmark)
- [ ] Site accessible at URL
- [ ] All routes working
- [ ] Authentication working
- [ ] Database queries working
- [ ] Custom domain configured (optional)
- [ ] DNS propagated (if using custom domain)

---

## Live Deployment Status

**Current Setup:**
- ✅ Repository: `https://github.com/ZETRAXUSS/ZETRAXUS-WEBSITE`
- ✅ Build: Next.js 16.3.5
- ✅ Runtime: Node.js 24.x
- ✅ Build command: `npm run build`
- ✅ Framework detection: Enabled
- ⏳ Cloudflare Pages: Ready to deploy

**Next Step:**
1. Connect repository in Cloudflare Pages
2. Set environment variables
3. First deployment will start automatically
4. Site will be live at `https://zetraxus-website.pages.dev`

---

## Support Links

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Cloudflare Pages Troubleshooting](https://developers.cloudflare.com/pages/platform/troubleshooting/)

---

**Status: Ready for Cloudflare Pages Deployment ✅**
