# Railway Deployment Guide

This guide will help you deploy this NestJS application to Railway.

## Prerequisites

1. A Railway account (sign up at [railway.app](https://railway.app))
2. Railway CLI installed (optional, for CLI deployment)
3. Your project repository connected to Railway

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended)

1. **Create a New Project**
   - Go to [railway.app](https://railway.app) and sign in
   - Click "New Project"
   - Select "Deploy from GitHub repo" (if your code is on GitHub) or "Empty Project"

2. **Configure the Service**
   - If deploying from GitHub, select your repository
   - Railway will automatically detect the Dockerfile
   - The build will start automatically

3. **Set Environment Variables**
   Add the following required environment variables in Railway's dashboard:

   **Database (PostgreSQL):**
   - `PG_DB_HOST` - PostgreSQL host
   - `PG_DB_PORT` - PostgreSQL port (usually 5432)
   - `PG_DB_USERNAME` - Database username
   - `PG_DB_PASSWORD` - Database password
   - `PG_DB_DATABASE` - Database name
   - `PG_DB_LOGGING` - Set to "true" for SQL logging (optional)

   **Redis:**
   - `REDIS_HOST` - Redis host
   - `REDIS_PORT` - Redis port (usually 6379)
   - `REDIS_PASSWORD` - Redis password (optional)
   - `REDIS_USERNAME` - Redis username (optional)
   - `REDIS_SLUG` - Redis prefix for Bull queue (default: "bull")

   **Application:**
   - `SERVER_URL` - Your application URL (Railway will provide this)
   - `NODE_ENV` - Set to "production"
   - `BULL_QUEUE_NAME` - Bull queue name

   **Google Service Account (for FCM):**
   - `GOOGLE_SERVICE_ACCOUNT_JSON` - The entire contents of your `dartinbox-f9514-21057035628e.json` file as a **single-line JSON string**.

     **How to set this:**
     1. Open your `dartinbox-f9514-21057035628e.json` file
     2. Copy the entire JSON content
     3. Convert it to a single line (remove all line breaks and extra spaces, or use `JSON.stringify()`)
     4. Paste it as the value for `GOOGLE_SERVICE_ACCOUNT_JSON` in Railway's environment variables

     **Quick command to get the value:**

     ```bash
     # On your local machine, run this to get the single-line JSON:
     cat dartinbox-f9514-21057035628e.json | jq -c .
     ```

     Or simply copy the file content and remove line breaks manually. The JSON should be valid when parsed.

   **Optional:**
   - `SENTRY_DSN` - Sentry DSN for error tracking
   - `SERVER_COOL_DOWN_PERIOD` - Server cooldown period in seconds

4. **Add PostgreSQL Service (if needed)**
   - In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically create a PostgreSQL database
   - Use the connection variables provided by Railway for your `PG_DB_*` environment variables

5. **Add Redis Service (if needed)**
   - In Railway dashboard, click "New" → "Database" → "Add Redis"
   - Railway will automatically create a Redis instance
   - Use the connection variables provided by Railway for your `REDIS_*` environment variables

6. **Deploy**
   - Railway will automatically build and deploy when you push to your connected branch
   - Or click "Deploy" in the dashboard to trigger a manual deployment

### Option 2: Deploy via Railway CLI

1. **Install Railway CLI**

   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**

   ```bash
   railway login
   ```

3. **Initialize Railway in your project**

   ```bash
   railway init
   ```

4. **Link to existing project or create new**

   ```bash
   railway link
   ```

5. **Set environment variables**

   ```bash
   railway variables set PG_DB_HOST=your_host
   railway variables set PG_DB_PORT=5432
   # ... set all other required variables
   ```

6. **Deploy**
   ```bash
   railway up
   ```

## Important Notes

- **Port Configuration**: The application automatically uses Railway's `PORT` environment variable. You don't need to set `SERVER_PORT` unless you want to override it.
- **Database Migrations**: You may need to run migrations manually after deployment. You can do this via Railway's console or by adding a migration job.
- **Build Time**: The first build may take several minutes as it installs dependencies and builds the application.
- **Health Checks**: Railway will automatically health check your application on the exposed port.

## Troubleshooting

1. **Build Fails**: Check the build logs in Railway dashboard. Common issues:
   - Missing environment variables
   - Build timeout (increase build timeout in Railway settings)
   - Memory issues during build

2. **Application Crashes**: Check the application logs:
   - Missing required environment variables
   - Database connection issues
   - Redis connection issues

3. **Port Issues**: Ensure your application listens on the port provided by Railway's `PORT` environment variable (which we've already configured in `main.ts`).

## Post-Deployment

After successful deployment:

1. Verify your application is running by checking the Railway dashboard
2. Access your application via the Railway-provided URL
3. Test your API endpoints
4. Set up custom domain (optional) in Railway settings
