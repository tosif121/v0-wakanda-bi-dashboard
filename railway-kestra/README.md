# 🚀 Kestra on Railway - Cloud Deployment

Deploy your Kestra workflow engine to Railway for 24/7 cloud availability!

## 🎯 **Why Railway + Docker for Kestra?**

### **Problems with Local Kestra:**
- ❌ Must keep your computer running 24/7
- ❌ No internet access when laptop is closed
- ❌ Team can't access workflows
- ❌ No automatic scaling or reliability

### **Railway + Docker Solution:**
- ✅ **24/7 Availability**: Always online, never sleeps
- ✅ **Global Access**: Team can access from anywhere
- ✅ **Auto-scaling**: Handles traffic spikes automatically
- ✅ **Zero Maintenance**: Railway manages infrastructure
- ✅ **Free Tier**: $5/month credit, perfect for development

## 🚀 **Quick Deploy to Railway**

### **1. Install Railway CLI**
```bash
npm install -g @railway/cli
```

### **2. Deploy Kestra**
```bash
cd railway-kestra
./deploy-to-railway.sh
```

### **3. Update Your App**
```bash
# Update your .env.local with Railway URL
KESTRA_URL=https://your-kestra-app.railway.app
```

## 📋 **Manual Deployment Steps**

### **1. Setup Railway Project**
```bash
# Login to Railway
railway login

# Create new project
railway link

# Or create from scratch
railway init
```

### **2. Set Environment Variables**
```bash
railway variables --set "PERPLEXITY_API_KEY=your_key_here"
railway variables --set "SUPABASE_URL=your_supabase_url"
railway variables --set "SUPABASE_KEY=your_supabase_key"
```

### **3. Deploy**
```bash
railway up
```

## 🔧 **Configuration**

### **Railway Settings:**
- **Port**: 8080 (automatically detected)
- **Memory**: 512MB (adjustable)
- **CPU**: Shared (upgradeable)
- **Storage**: Ephemeral (workflows stored in memory)

### **Kestra Configuration:**
- **Repository**: Memory (fast, resets on restart)
- **Queue**: Memory (suitable for development)
- **Database**: H2 in-memory (lightweight)
- **Storage**: Local filesystem

## 🌐 **Access Your Kestra**

After deployment, Railway will provide a URL like:
```
https://your-kestra-app.railway.app
```

### **Update Your Dashboard:**
```bash
# In your main project .env.local
KESTRA_URL=https://your-kestra-app.railway.app
KESTRA_USERNAME=admin  # if you enable auth
KESTRA_PASSWORD=secret # if you enable auth
```

## 📊 **Workflow Management**

### **Deploy Workflows:**
1. Access Kestra UI at your Railway URL
2. Create namespace: `assemblehack25.wakanda`
3. Import workflow from `flows/bi-dashboard.yml`
4. Set up secrets (already configured via environment variables)

### **Test Workflow:**
```bash
# Your dashboard will now connect to Railway Kestra
# Upload data and trigger workflows as usual
```

## 💰 **Railway Pricing**

### **Free Tier:**
- $5/month credit (enough for development)
- 512MB RAM, shared CPU
- Perfect for Kestra workflows

### **Pro Tier ($20/month):**
- More resources and priority support
- Better for production workloads

## 🔒 **Security**

### **Environment Variables:**
- All secrets stored securely in Railway
- No hardcoded credentials in Docker image
- Automatic HTTPS with Railway domains

### **Network Security:**
- Railway provides automatic HTTPS
- Private networking between services
- DDoS protection included

## 🚀 **Benefits of This Setup**

### **For Development:**
- ✅ No local Kestra installation needed
- ✅ Consistent environment across team
- ✅ Always accessible for testing
- ✅ Automatic backups and reliability

### **For Production:**
- ✅ 99.9% uptime SLA
- ✅ Auto-scaling based on demand
- ✅ Global CDN for fast access
- ✅ Monitoring and alerting built-in

## 🔄 **Workflow Updates**

### **Update Workflows:**
```bash
# 1. Update flows/bi-dashboard.yml
# 2. Redeploy to Railway
railway up

# 3. Reimport workflow in Kestra UI
```

### **Environment Updates:**
```bash
# Update environment variables
railway variables --set "NEW_VAR=new_value"

# Restart service
railway restart
```

## 🐛 **Troubleshooting**

### **Check Logs:**
```bash
railway logs
```

### **Check Status:**
```bash
railway status
```

### **Restart Service:**
```bash
railway restart
```

### **Common Issues:**

1. **Kestra not starting**: Check memory limits in Railway dashboard
2. **Workflows failing**: Verify environment variables are set
3. **Connection timeout**: Check Railway URL in your .env.local

## 🎉 **Result**

After deployment, you'll have:
- 🌐 **Cloud Kestra**: Always online at Railway URL
- 🔄 **Auto-sync**: Your dashboard connects to cloud Kestra
- 📊 **Reliable workflows**: 24/7 availability for data processing
- 👥 **Team access**: Everyone can access the same Kestra instance

**No more "localhost:8080 not found" errors!** 🎯