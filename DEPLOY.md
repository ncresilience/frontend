# Render Deployment Guide

## Frontend Deployment Steps

### 1. Render Dashboard Configuration
- **Service Type**: Web Service (NOT Static Site)
- **Environment**: Node
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x or higher

### 2. Environment Variables Required
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://nc-resilience-backend.onrender.com/api
```

### 3. Common Issues & Solutions

#### "Build failed" with empty build command
- ✅ Make sure service type is "Web Service"
- ❌ NOT "Static Site"

#### Missing build directory
- ✅ Use `npm run build` (creates .next directory)
- ❌ Don't look for `build/` directory

#### Port configuration
- ✅ Render automatically assigns PORT environment variable
- ✅ Next.js uses it automatically with `npm start`

### 4. Deployment Checklist
- [ ] Repository connected to Render
- [ ] Service type set to "Web Service"
- [ ] Build command: `npm ci && npm run build`
- [ ] Start command: `npm start`
- [ ] Environment variables configured
- [ ] Backend API URL points to deployed backend

### 5. Manual Deployment Trigger
If auto-deploy fails, trigger manual deployment after:
1. Confirming service configuration
2. Checking build logs
3. Verifying environment variables