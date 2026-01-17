# Git Workflow Guide

## Current Configuration

**Repository**: https://github.com/wecaredigital/base.wecare.digital.git  
**Current Branch**: `base`  
**Remote**: `origin`

## Git Settings Applied

✅ **Auto-setup merge**: New branches automatically track remote  
✅ **Pull strategy**: Merge (not rebase) - `pull.rebase = false`  
✅ **Push default**: Current branch - `push.default = current`  
✅ **Fetch prune**: Auto-remove deleted remote branches - `fetch.prune = true`  
✅ **Line endings**: Auto-convert for Windows - `core.autocrlf = true`

## Common Commands

### Daily Workflow

```bash
# Pull latest changes from remote
git pull

# Check status
git status

# Add files
git add .

# Commit changes
git commit -m "feat: your message here"

# Push to remote
git push
```

### Branch Management

```bash
# Create new feature branch
git checkout -b feature/your-feature-name

# Switch branches
git checkout base
git checkout main

# List all branches
git branch -a

# Delete local branch
git branch -d feature/old-feature
```

### Sync with Remote

```bash
# Fetch all remote changes
git fetch --all --prune

# Pull and merge
git pull origin base

# Push current branch
git push

# Push and set upstream
git push -u origin feature/your-feature
```

## Branch Strategy (Per Master Build Prompt)

### Production Branches
- **`main`** → Production (SEND_MODE=LIVE)
  - Direct commits forbidden
  - PR required
  - Auto-deploys to https://base.wecare.digital

### Development Branches
- **`feature/*`** → Preview (SEND_MODE=DRY_RUN)
  - Auto-deploys to preview environment
  - Example: `feature/whatsapp-inbound`

- **`release/*`** → Staging (SEND_MODE=DRY_RUN)
  - Auto-deploys to staging environment
  - Example: `release/v1.0.0`

- **`hotfix/*`** → Production (SEND_MODE=LIVE)
  - For urgent production fixes
  - Example: `hotfix/fix-validation-bug`

### Current Branch
- **`base`** → Template/Base branch
  - Contains base configuration
  - Used as starting point for new features

## Amplify Deployment Flow

```
Local Changes
    ↓
git commit
    ↓
git push
    ↓
AWS Amplify CI/CD Pipeline
    ↓
Automatic Deployment
    ↓
Environment (based on branch)
```

## Auto-Pull Setup

To automatically pull before push:

```bash
# Add pre-push hook
git config --local core.hooksPath .git/hooks

# Or manually pull before push
git pull && git push
```

## Useful Aliases (Optional)

Add to your Git config:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"
git config --global alias.lg "log --oneline --graph --decorate"
```

## Troubleshooting

### Merge Conflicts
```bash
# Pull with conflicts
git pull

# Resolve conflicts in files
# Then:
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

### Undo Last Commit (Not Pushed)
```bash
git reset --soft HEAD~1
```

### Discard Local Changes
```bash
git restore .
```

### View Remote Info
```bash
git remote -v
git remote show origin
```

## Important Notes

⚠️ **Cloud-Only Deployment**: Never use local AWS credentials  
⚠️ **No Direct Main Commits**: Always use PR for main branch  
⚠️ **DRY_RUN Enforcement**: Non-production branches cannot send live messages  
⚠️ **Secrets**: Never commit secrets (use Amplify Secrets)

## Next Steps

1. **Push current commit**: `git push`
2. **Create feature branch**: `git checkout -b feature/amplify-setup`
3. **Start implementation**: Follow tasks.md
4. **Deploy via Amplify**: Push triggers automatic deployment

---

**Last Updated**: 2026-01-17  
**Maintained By**: DevOps Team
