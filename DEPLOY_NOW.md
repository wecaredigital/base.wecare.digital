# Deploy Media Fix Now

## One Command

```bash
npx ampx sandbox --once
```

## What Gets Fixed

✅ Media storage in database  
✅ Download button in inbox  
✅ PDF filename issue  
✅ S3 flat structure  
✅ Pre-signed URLs  

## Test After Deploy

1. Send a PDF file
2. See download button (⬇️)
3. Click to download
4. Done!

## Files Changed

- `amplify/data/resource.ts` - Schema
- `amplify/functions/outbound-whatsapp/handler.py` - Filename handling
- `src/pages/dm/whatsapp/index.tsx` - Download button
- `src/lib/api.ts` - API interface
- `src/components/Layout.css` - Button styling

## Time

- Deploy: 2-3 minutes
- Test: 5 minutes
- Total: ~10 minutes

## Status

✅ Ready for production

---

**Deploy now!** 🚀
