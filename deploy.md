# Farmer's Marketplace - Deployment Instructions

## Quick Deploy to Railway.app

### Step 1: Prepare the Project
1. Make sure all files are committed to your repository
2. The project is now ready for deployment

### Step 2: Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the Node.js project
6. Set the following environment variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = A random secret string
   - `PORT` = `3000` (Railway will override this)

### Step 3: Configure MongoDB
1. Use MongoDB Atlas (free tier available)
2. Create a new cluster
3. Get your connection string
4. Add it to Railway environment variables

### Step 4: Deploy
1. Railway will automatically build and deploy your project
2. The deployment will take 2-3 minutes
3. You'll get a live URL like: `https://your-project-name.railway.app`

## Alternative: Deploy to Render.com

### Step 1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Deploy Web Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `farmers-marketplace`
   - **Environment**: `Node`
   - **Build Command**: `npm install && cd client && npm install && npm run build`
   - **Start Command**: `npm run server:prod`
   - **Plan**: Free

### Step 3: Set Environment Variables
- `NODE_ENV` = `production`
- `MONGODB_URI` = Your MongoDB connection string
- `JWT_SECRET` = Random secret string

## Features After Deployment

✅ **Products**: Farmers can list products with images, prices, and quantities
✅ **Direct Contact**: Users see farmer's phone number for direct contact
✅ **Auctions**: Live bidding with mobile number requirement
✅ **User Authentication**: Secure login/register system
✅ **Real-time Updates**: Live auction status and bid updates
✅ **Mobile Responsive**: Works on all devices
✅ **Location Filtering**: Filter products by city/district

## Live Demo
Once deployed, your application will be available at the provided URL with all features working dynamically.

## Support
If you encounter any issues during deployment, check:
1. Environment variables are set correctly
2. MongoDB connection string is valid
3. All dependencies are installed
4. Build process completes successfully 