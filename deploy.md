# Quick Deployment Checklist

## Before Deploying to Vercel

### ✅ Environment Variables
Make sure these are set in Vercel:
- `GEMINI_API_KEY` - Your Google Gemini API key
- `DATABASE_URL` - Your database connection (optional)

### ✅ Code Changes
- [ ] All TypeScript errors are fixed
- [ ] Build passes locally (`npm run build`)
- [ ] API routes are in `/api` directory
- [ ] No `vercel.json` file (using auto-detection)

### ✅ Dependencies
- [ ] All dependencies are in `package.json`
- [ ] `@vercel/node` is installed
- [ ] Node.js version is specified (>=18.0.0)

### ✅ File Structure
```
/api/
  /resume/
    analyze.ts
/server/
  index.ts
  routes.ts
  db.ts
  gemini.ts
  document-parser.ts
  vite.ts
  dev.ts
/dist/          (built by npm run build)
package.json
```

## Deployment Steps

1. **Push to Git**: Ensure all changes are committed and pushed
2. **Connect to Vercel**: Import your repository
3. **Set Environment Variables**: Add them in Vercel dashboard
4. **Deploy**: Click deploy and wait for build
5. **Test**: Verify the API endpoints work

## Common Issues Fixed

- ✅ Port conflicts (EADDRINUSE)
- ✅ TypeScript compilation errors
- ✅ Vercel configuration conflicts
- ✅ Missing dependencies
- ✅ Import path issues 