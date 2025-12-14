# 🔧 Render Deployment Troubleshooting

## Common Issues and Solutions

### ❌ **Issue: "Node.js version >=20.9.0 is required" Error**

**Problem**: Render is building the main Next.js application instead of the Kestra container.

**Symptoms**:
```
You are using Node.js 18.20.8. For Next.js, Node.js version ">=20.9.0" is required.
ELIFECYCLE Command failed with exit code 1.
```

**Root Cause**: Render is using the wrong Dockerfile (the main app's Dockerfile instead of Kestra's).

**Solution**:
1. ✅ **Set Root Directory**: In Render dashboard, set Root Directory to `render-kestra`
2. ✅ **Verify Dockerfile Path**: Should be `./Dockerfile` (relative to render-kestra)
3. ✅ **Check Build Context**: Render should build from the render-kestra folder

### ❌ **Issue: "Cannot find Dockerfile" Error**

**Problem**: Render can't locate the Dockerfile.

**Solution**:
1. Ensure Root Directory is set to `render-kestra`
2. Dockerfile Path should be `./Dockerfile` (not `./render-kestra/Dockerfile`)
3. Verify the repository is connected correctly

### ❌ **Issue: Environment Variables Not Working**

**Problem**: Kestra fails to start due to missing environment variables.

**Solution**:
1. Set all required variables in Render dashboard:
   - `KESTRA_SERVER_PORT=10000`
   - `KESTRA_SECURITY_BASIC_USERNAME=your_username`
   - `KESTRA_SECURITY_BASIC_PASSWORD=your_password`
   - `KESTRA_DATASOURCES_POSTGRES_PASSWORD=db_password`
   - API keys from .env.local

### ❌ **Issue: Port Binding Problems**

**Problem**: Service starts but can't be reached.

**Solution**:
1. Ensure `KESTRA_SERVER_PORT=10000` is set
2. Verify Render is mapping port 10000 correctly
3. Check health check endpoint is responding

### ❌ **Issue: Authentication Problems**

**Problem**: Can't login to Kestra UI.

**Solution**:
1. Verify security environment variables are set correctly
2. Use the exact username/password you configured
3. Check Kestra logs for authentication errors

## 🔍 **Debugging Steps**

### 1. **Check Build Logs**
- Go to Render dashboard → Your service → Logs
- Look for Docker build process
- Verify it's building from Kestra base image, not Node.js

### 2. **Verify Configuration**
- Root Directory: `render-kestra` ✅
- Environment: `Docker` ✅
- Dockerfile Path: `./Dockerfile` ✅

### 3. **Test Environment Variables**
- Check all required variables are set
- Verify no typos in variable names
- Ensure values are not empty

### 4. **Monitor Service Health**
- Check service status in Render dashboard
- Monitor health check endpoint
- Review application logs for errors

## 📞 **Getting Help**

If you're still having issues:

1. **Check Render Status**: [status.render.com](https://status.render.com)
2. **Review Logs**: Always check both build and runtime logs
3. **Verify Repository**: Ensure latest changes are pushed to GitHub
4. **Test Locally**: Verify Dockerfile works with local Docker build

## 🚀 **Success Indicators**

Your deployment is working when you see:
- ✅ Build completes successfully using Kestra base image
- ✅ Service starts and health checks pass
- ✅ Kestra UI is accessible at your Render URL
- ✅ Authentication works with your credentials
- ✅ Workflows can be imported and executed

---
**Remember**: The key is ensuring Render builds from the `render-kestra` directory, not the root directory!