# Package Lock File Fix Guide

**Date**: 2026-01-21  
**Issue**: package-lock.json is incomplete/corrupted  
**Status**: FIXING

---

## Problem Analysis

### Root Cause
Your `package-lock.json` is incomplete and missing entries for many required dependencies:

**Missing Packages**:
- `json-schema-to-ts@3.1.1`
- `ts-algebra@2.0.0`
- `@aws-sdk/eventstream-handler-node@3.821.0`
- `@aws-sdk/middleware-eventstream@3.821.0`
- `@smithy/*` (multiple packages)
- `jsonfile@6.2.0`
- `universalify@2.0.1`
- And many more...

### Why This Happens
Your project uses Amplify Gen2 packages which depend heavily on AWS SDK v3 + Smithy libraries. These have deep dependency trees that must be fully resolved in the lock file.

**Common causes**:
1. Lock file created with `npm install --omit=dev` (dev dependencies missing)
2. Lock file generated with different npm version or OS
3. Lock file partially edited or merge-conflicted
4. Lock file trimmed/corrupted during git operations

### Why npm ci Fails
- `npm ci` requires 100% exact match between package.json and package-lock.json
- If ANY dependency is missing from lock file → npm ci fails immediately
- `npm install` is more forgiving (tries to fix missing entries)
- AWS Amplify builds use `npm ci` → deployment fails

---

## Solution: Regenerate Lock File

### Step 1: Clean Up (Already Done)
```bash
rm -rf node_modules package-lock.json
```

✅ Completed

### Step 2: Regenerate Lock File
```bash
npm install
```

**What this does**:
- Reads package.json
- Downloads all dependencies (including transitive)
- Generates complete package-lock.json
- Installs all packages to node_modules

**Expected time**: 5-10 minutes (first time)

**Expected output**:
```
added XXX packages in XXm
```

### Step 3: Verify Lock File
```bash
npm ci
```

**Expected output**:
```
up to date, audited XXX packages
```

If this succeeds, lock file is correct.

### Step 4: Commit Changes
```bash
git add package-lock.json
git commit -m "Fix: Regenerate package-lock.json for Amplify CI/CD"
git push
```

### Step 5: Deploy
```bash
npm run amplify:deploy
```

---

## What's Being Fixed

### Before (Broken)
```json
{
  "packages": {
    "": {
      "dependencies": {
        "json-schema-to-ts": "3.1.1",  // ← Referenced but...
        "@aws-sdk/eventstream-handler-node": "3.821.0"  // ← Missing entries below
      }
    },
    "node_modules/json-schema-to-ts": {
      // ← MISSING! This entry should exist
    }
  }
}
```

### After (Fixed)
```json
{
  "packages": {
    "": {
      "dependencies": {
        "json-schema-to-ts": "3.1.1",
        "@aws-sdk/eventstream-handler-node": "3.821.0"
      }
    },
    "node_modules/json-schema-to-ts": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/json-schema-to-ts/-/json-schema-to-ts-3.1.1.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "ts-algebra": "2.0.0"
      }
    },
    "node_modules/ts-algebra": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/ts-algebra/-/ts-algebra-2.0.0.tgz",
      "integrity": "sha512-..."
    },
    // ... all transitive dependencies fully resolved
  }
}
```

---

## Dependency Tree (What Gets Installed)

### Direct Dependencies (from package.json)
```
@aws-amplify/backend@^1.0.0
@aws-amplify/ui-react@^6.13.2
aws-amplify@^6.0.0
next@^14.0.0
react@^18.2.0
react-dom@^18.2.0
react-router-dom@^7.12.0
```

### Transitive Dependencies (from lock file)
```
@aws-amplify/backend
  ├── @aws-amplify/backend-cli
  ├── @aws-amplify/backend-data
  ├── @aws-amplify/data-construct
  └── aws-amplify
      ├── @aws-sdk/client-cognito-identity
      ├── @aws-sdk/client-dynamodb
      ├── @aws-sdk/client-s3
      ├── @aws-sdk/client-sqs
      ├── @aws-sdk/client-sns
      ├── @aws-sdk/client-lambda
      ├── @aws-sdk/client-bedrock-agent
      ├── @aws-sdk/client-bedrock-agent-runtime
      ├── @smithy/core
      ├── @smithy/middleware-endpoint
      ├── @smithy/middleware-retry
      ├── @smithy/middleware-serde
      ├── @smithy/protocol-http
      ├── @smithy/signature-v4
      ├── @smithy/util-base64
      ├── @smithy/util-body-length-browser
      ├── @smithy/util-defaults-mode-browser
      ├── @smithy/util-defaults-mode-node
      ├── @smithy/util-endpoints
      ├── @smithy/util-hex-encoding
      ├── @smithy/util-middleware
      ├── @smithy/util-retry
      ├── @smithy/util-stream
      ├── @smithy/util-stream-browser
      ├── @smithy/util-uri-escape
      ├── @smithy/util-utf8
      └── ... many more
```

All of these must be in package-lock.json for `npm ci` to work.

---

## Verification Steps

### Step 1: Check npm Version
```bash
npm --version
# Should be >= 9.0.0
```

### Step 2: Check Node Version
```bash
node --version
# Should be >= 18.0.0
```

### Step 3: Verify Lock File Exists
```bash
ls -la package-lock.json
# Should show file size > 1MB (because of all dependencies)
```

### Step 4: Test npm ci
```bash
npm ci
# Should succeed with "up to date" message
```

### Step 5: Verify Packages Installed
```bash
ls node_modules | wc -l
# Should show 500+ packages
```

---

## Troubleshooting

### Issue: npm install hangs or is very slow

**Solution**:
```bash
# Use npm registry mirror
npm config set registry https://registry.npmjs.org/

# Or use faster mirror
npm config set registry https://mirrors.aliyun.com/npm/

# Then retry
npm install
```

### Issue: npm install fails with permission error

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Retry
npm install
```

### Issue: npm install fails with network error

**Solution**:
```bash
# Check internet connection
ping registry.npmjs.org

# Retry with verbose output
npm install --verbose
```

### Issue: package-lock.json still incomplete after npm install

**Solution**:
```bash
# Delete and retry
rm -rf node_modules package-lock.json
npm install --no-optional
npm ci
```

---

## After Lock File is Fixed

### 1. Verify npm ci Works
```bash
npm ci
# Should succeed
```

### 2. Build Application
```bash
npm run build
# Should succeed
```

### 3. Deploy to AWS
```bash
npm run amplify:deploy
# Should succeed
```

### 4. Commit Changes
```bash
git add package-lock.json
git commit -m "Fix: Regenerate package-lock.json for Amplify CI/CD"
git push
```

---

## Why This Fixes Deployment

### Before (Broken)
```
npm ci
  ↓
Reads package-lock.json
  ↓
Finds missing entries
  ↓
❌ FAILS: "Missing: json-schema-to-ts@3.1.1 from lock file"
  ↓
Amplify deployment fails
```

### After (Fixed)
```
npm ci
  ↓
Reads package-lock.json
  ↓
All entries present
  ↓
✅ SUCCESS: "up to date, audited XXX packages"
  ↓
Amplify deployment succeeds
```

---

## Key Points

✅ **Lock file must be complete** - All transitive dependencies must be listed  
✅ **npm ci requires exact match** - 100% sync between package.json and package-lock.json  
✅ **npm install is forgiving** - Tries to fix missing entries  
✅ **Amplify uses npm ci** - So lock file must be perfect  
✅ **Regeneration is safe** - Just deletes and rebuilds from package.json  
✅ **No code changes needed** - Only lock file needs fixing  

---

## Next Steps

1. **Wait for npm install to complete** (5-10 minutes)
2. **Verify npm ci works**: `npm ci`
3. **Commit lock file**: `git add package-lock.json && git commit -m "Fix lockfile"`
4. **Push changes**: `git push`
5. **Deploy**: `npm run amplify:deploy`

---

**Status**: FIXING  
**Expected Time**: 5-10 minutes  
**Next Step**: Wait for npm install to complete, then run `npm ci` to verify

