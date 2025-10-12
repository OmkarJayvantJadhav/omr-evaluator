# OMR Evaluator Deployment Guide (Railway + Vercel)

This guide will walk you through deploying your OMR Evaluator application with:
- **Frontend**: Deployed to Vercel (React + Vite)
- **Backend**: Deployed to Railway using Docker (FastAPI)
- **Database**: Managed MySQL database on Railway
- **Storage**: File uploads stored in Docker container

## Architecture Overview

```
[Vercel Frontend] → [Railway Backend] → [Railway MySQL]
     (React)           (FastAPI)         (500MB Free)
```

## Prerequisites

1. GitHub account (for code repository)
2. Vercel account (free tier available)
3. Railway account (free $5 credit, then pay-as-you-go)
4. Your code pushed to a GitHub repository

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Railway + Vercel deployment"
   git push origin main
   ```

2. **Verify all deployment files are in place**:
   - `backend/Dockerfile` ✅
   - `railway.json` ✅
   - `frontend/vercel.json` ✅
   - Environment variable templates ✅

## Step 2: Deploy Backend to Railway

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app) and sign up
2. Connect your GitHub account
3. You get $5 free credit to start

### 2.2 Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your OMR evaluator repository
4. Railway will detect the `railway.json` configuration

### 2.3 Add MySQL Database
1. In your Railway project dashboard, click **+ New**
2. Select **Database** → **Add MySQL**
3. Railway will create a managed MySQL instance
4. **Note the database connection details** (available in Variables tab)

### 2.4 Configure Backend Service
1. Your backend service should auto-deploy
2. Go to **Settings** → **Environment**
3. Add the following environment variables:

```bash
# Database (Railway auto-generates this when you add MySQL)
DATABASE_URL=${{MySQL.DATABASE_URL}}

# JWT Secret (set your own secure key)
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# CORS Origins (update after Vercel deployment)
CORS_ORIGINS=https://your-vercel-app.vercel.app

# OMR Settings
ALLOW_RESUBMISSION=true
REQUIRE_TEACHER_APPROVAL=false
```

### 2.5 Deploy and Get URL
1. Railway will automatically build and deploy using Docker
2. Wait for deployment (3-5 minutes)
3. Get your backend URL from the **Deployments** tab
4. Format: `https://your-service-name.up.railway.app`

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub account

### 3.2 Deploy Frontend
1. Click **New Project**
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### 3.3 Set Environment Variables
In Vercel **Environment Variables** section:
```bash
VITE_API_URL=https://your-railway-app.up.railway.app
```

### 3.4 Deploy
1. Click **Deploy**
2. Wait for deployment (2-3 minutes)
3. Get your frontend URL: `https://your-app.vercel.app`

## Step 4: Update CORS and Redeploy

### 4.1 Update Backend CORS
1. Go to Railway project → Backend service → **Variables**
2. Update `CORS_ORIGINS` with your actual Vercel URL:
   ```
   CORS_ORIGINS=https://your-actual-vercel-url.vercel.app
   ```
3. Railway will auto-redeploy

### 4.2 Update Configuration Files (Optional)
For future deployments, update:
- `frontend/vercel.json` - Replace Railway URL
- `backend/config.py` - Update default CORS origins

## Step 5: Database Setup & Migration

### 5.1 Database Tables
Your FastAPI app will automatically create tables on first run when it connects to MySQL.

### 5.2 Optional: Migrate Existing Data
If you have existing SQLite data:
1. Use the `migrate_to_mysql.py` script in your backend
2. Update it to use Railway MySQL connection
3. Run locally to migrate data

## Step 6: Testing Your Deployment

### 6.1 Test Backend
1. Visit `https://your-railway-app.up.railway.app/health`
2. Should return: `{"status": "healthy", ...}`
3. Visit `https://your-railway-app.up.railway.app/docs` for API documentation

### 6.2 Test Frontend
1. Visit your Vercel URL
2. Test user registration/login
3. Test OMR upload and processing
4. Check browser console for errors

### 6.3 Test Database Connection
1. Register a new user
2. Create an exam
3. Upload an OMR sheet
4. Verify data is stored in Railway MySQL

## Step 7: Monitoring & Management

### 7.1 Railway Monitoring
- **Metrics**: CPU, memory, network usage
- **Logs**: Real-time application logs
- **Database**: Connection count, storage usage
- **Costs**: Track usage and spending

### 7.2 Vercel Monitoring  
- **Analytics**: Page views, performance
- **Functions**: API calls (if any)
- **Deployments**: Build logs and status

## Common Issues & Troubleshooting

### 1. CORS Errors
```
Access to fetch at 'https://railway...' from origin 'https://vercel...' has been blocked by CORS
```
**Solution**: Update `CORS_ORIGINS` environment variable in Railway

### 2. Database Connection Failed
```
Can't connect to MySQL server
```
**Solution**: 
- Check `DATABASE_URL` format: `mysql+pymysql://user:pass@host:port/db`
- Verify MySQL service is running in Railway

### 3. File Upload Errors
```
413 Request Entity Too Large
```
**Solution**: 
- Railway has request size limits
- Check your file size limits in backend configuration
- Consider using external storage for large files

### 4. Service Sleeping (Free Tier)
Railway free tier may sleep after inactivity.
**Solution**: 
- First request may be slow (cold start)
- Consider upgrading for production use
- Implement health check pings if needed

## Cost Breakdown

### Railway (Pay-as-you-go after $5 credit)
- **Web Service**: ~$5/month for basic usage
- **MySQL Database**: ~$5/month for 1GB storage
- **Total**: ~$10/month for moderate usage

### Vercel
- **Frontend**: Free for personal projects
- **Pro Plan**: $20/month for teams (optional)

### Total Monthly Cost: ~$10-30

## Scaling Considerations

### Railway Scaling
- **Vertical**: Increase CPU/RAM per service
- **Database**: Increase storage and connections
- **Multiple Regions**: Deploy closer to users

### Performance Tips
- **Database**: Use connection pooling
- **Backend**: Implement caching for frequent queries
- **Frontend**: Enable Vercel Edge Network
- **Files**: Consider external storage (AWS S3) for large uploads

## Security Checklist

- [ ] Strong `SECRET_KEY` set
- [ ] CORS properly configured
- [ ] Database uses SSL (Railway default)
- [ ] Environment variables not committed to Git
- [ ] File upload size limits enforced
- [ ] Input validation on all endpoints

## Backup Strategy

### Database Backups
- Railway provides automatic daily backups
- Manual backups available through Railway CLI
- Consider exporting critical data regularly

### Code Backups
- GitHub repository serves as code backup
- Tag releases for easy rollback

---

## Quick Commands Reference

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy to Railway
railway up

# View logs
railway logs

# Connect to database
railway connect mysql
```

## Support Resources

- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Railway Discord Community](https://discord.gg/railway)

---

**🚀 Deployment Complete!**

Your OMR Evaluator is now live at:
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-railway-app.up.railway.app
- **Database**: Managed MySQL on Railway