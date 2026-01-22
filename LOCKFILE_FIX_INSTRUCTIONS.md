# Package Lock File Fix - Step by Step Instructions

## Problem
Your `package-lock.json` is incomplete and missing 100+ @smithy/* and AWS SDK v3 packages. This causes `npm ci` to fail during Amplify deployment.

## Solution: Regenerate Lock File Locally

### Prerequisites
- Node.js >= 18 (you have 20 via .nvmrc)
- npm >= 8
- Git access to repository

### Step 1: Clean Up Locally

Open your terminal/command prompt and run:

```bash
# Navigate to your project directory
cd /path/to/base.wecare.digital

# Remove node_modules and lock file
rm -rf node_modules
rm package-lock.json

# On Windows PowerShell, use:
# Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
# Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
```

### Step 2: Regenerate Lock File

```bash
# Install dependencies (this regenerates package-lock.json correctly)
npm install --legacy-peer-deps --no-audit --no-fund

# This will take 3-5 minutes
# It will download and resolve ALL dependencies including:
# - @aws-amplify/* packages
# - @aws-sdk/* packages  
# - @smithy/* packages (100+ packages)
# - All transitive dependencies
```

### Step 3: Verify npm ci Works

```bash
# Test that npm ci can now work with the new lock file
npm ci

# This should complete successfully without errors
# If it fails, the lock file is still incomplete
```

### Step 4: Commit and Push

```bash
# Add the new lock file
git add package-lock.json

# Commit with message
git commit -m "Fix: Regenerate package-lock.json for npm ci compatibility

- Removed incomplete lock file
- Regenerated with npm install
- Includes all @smithy/* and @aws-sdk/* dependencies
- Verified npm ci works locally
- Ready for Amplify deployment"

# Push to GitHub
git push origin main
```

### Step 5: Clear Amplify Build Cache

1. Go to AWS Amplify Console
2. Select your app: `base.wecare.digital`
3. Go to **App settings** → **Build settings**
4. Click **Clear cache** button
5. This ensures Amplify doesn't use old cached node_modules

### Step 6: Redeploy

```bash
# Option A: Via Amplify Console
# - Go to Deployments
# - Click "Redeploy this version"
# - Wait for build to complete (should succeed now)

# Option B: Via CLI
npm run amplify:deploy
```

---

## What Gets Fixed

### Before (Broken Lock File)
```
❌ Missing: @smithy/util-body-length-browser@4.2.0
❌ Missing: @smithy/util-utf8@4.2.0
❌ Missing: @smithy/abort-controller@4.2.8
❌ Missing: @smithy/querystring-builder@4.2.8
❌ Missing: @smithy/util-uri-escape@4.2.0
❌ Missing: @smithy/querystring-parser@4.2.8
❌ Missing: @smithy/util-buffer-from@4.2.0
❌ Missing: @smithy/is-array-buffer@4.2.0
❌ Missing: @smithy/service-error-classification@4.2.8
❌ Missing: @smithy/fetch-http-handler@5.3.9
❌ Missing: @smithy/util-hex-encoding@4.2.0
❌ Missing: json-schema-to-ts@3.1.1
❌ Missing: ts-algebra@2.0.0
❌ Missing: jsonfile@6.2.0
❌ Missing: universalify@2.0.1
... and 80+ more packages
```

### After (Fixed Lock File)
```
✅ All @smithy/* packages included
✅ All @aws-sdk/* packages included
✅ All transitive dependencies resolved
✅ npm ci works without errors
✅ Amplify deployment succeeds
```

---

## Troubleshooting

### Issue: npm install Still Times Out

**Solution:**
```bash
# Try with increased timeout
npm install --legacy-peer-deps --no-audit --no-fund --fetch-timeout=120000

# Or use yarn instead
yarn install
```

### Issue: npm ci Still Fails After Regeneration

**Solution:**
```bash
# Verify lock file is valid JSON
npm ls

# If errors, try again:
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps --no-audit --no-fund
npm ci
```

### Issue: Amplify Still Fails After Push

**Solution:**
1. Clear Amplify build cache (see Step 5 above)
2. Check Amplify build logs for specific errors
3. Verify Node version is 20 (check .nvmrc file)
4. Redeploy

---

## Why This Works

1. **npm install** is permissive - it fixes incomplete lock files
2. **npm ci** is strict - it requires 100% match with lock file
3. Amplify uses `npm ci` for deterministic builds
4. Regenerating locally ensures all dependencies are resolved
5. Committing the new lock file ensures Amplify has complete dependency tree

---

## Expected Timeline

| Step | Time |
|------|------|
| Clean up | 1 min |
| npm install | 3-5 min |
| npm ci verification | 1 min |
| Git commit/push | 1 min |
| Clear Amplify cache | 1 min |
| Amplify redeploy | 10-15 min |
| **Total** | **~20-25 min** |

---

## Success Indicators

✅ npm install completes without errors  
✅ npm ci completes without errors  
✅ package-lock.json file size > 5MB (was probably < 2MB before)  
✅ Git push succeeds  
✅ Amplify build succeeds  
✅ Deployment completes  
✅ Frontend is accessible  

---

## Next Steps After Deployment

1. Test incoming WhatsApp messages
2. Test PDF file sending
3. Check CloudWatch logs for errors
4. Monitor dashboard for issues

---

## Support

If you encounter issues:
1. Check Amplify build logs for specific error messages
2. Verify Node version: `node --version` (should be 20.x)
3. Verify npm version: `npm --version` (should be 8+)
4. Try clearing browser cache and reloading dashboard
5. Check CloudWatch logs for Lambda errors

---

**Status**: Ready to execute  
**Confidence**: HIGH  
**Risk**: LOW (only changes lock file, no code changes)
