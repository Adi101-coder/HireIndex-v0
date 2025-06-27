# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab Repository**: Your code should be in a Git repository
3. **Environment Variables**: Set up the required environment variables

## Environment Variables Setup

In your Vercel project settings, add these environment variables:

### Required
- `GEMINI_API_KEY`: Your Google Gemini API key
- `DATABASE_URL`: Your PostgreSQL database connection string (optional for basic functionality)

### Optional
- `NODE_ENV`: Set to `production`

## Deployment Steps

### 1. Connect Repository
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select the repository containing this project

### 2. Configure Build Settings
Vercel will automatically detect the configuration from `package.json`:

- **Framework Preset**: Vite (auto-detected)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 3. Deploy
1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at the provided URL

## API Routes

The application uses Vercel's API routes structure:

- `/api/resume/analyze` - Resume upload and analysis endpoint
- All other routes serve the React frontend

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes locally

2. **API Errors**
   - Verify environment variables are set correctly
   - Check Vercel function logs for detailed error messages

3. **File Upload Issues**
   - Ensure files are under 5MB
   - Check that file types are PDF or DOCX

### Environment Variables Not Working
- Make sure to redeploy after adding environment variables
- Check that variable names match exactly (case-sensitive)

### Database Connection Issues
- If using a database, ensure it's accessible from Vercel's servers
- Consider using Vercel Postgres or other cloud databases

## Local Development

For local development, use:

```bash
npm run dev        # Frontend development
npm run dev:server # Backend development
```

## Production vs Development

- **Development**: Uses Vite dev server and local Express server
- **Production**: Uses Vercel's serverless functions and static file serving

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally first
4. Check the README.md for general troubleshooting 