# 📉 Reducing Serverless Function Size

The error `Max serverless function size of 250 MB uncompressed reached` is happening because Vercel is trying to bundle the massive `onnxruntime-node` binaries (403 MB!) into every single API route.

## The Fix Applied
I have updated `next.config.js` to explicitly **exclude** these large files from the serverless function bundle.

```javascript
    outputFileTracingExcludes: {
      '*': [
        './node_modules/onnxruntime-node/bin/**/*',
        './public/models/**/*',
      ],
    },
```

## ⚠️ Important: Check `package.json`
You are using `onnxruntime-web` in your `package.json`, but the error logs show `onnxruntime-node` taking up space. This usually happens because `onnxruntime-web` might depend on it or it was installed previously.

If the build still fails, you might need to:
1. **Remove `onnxruntime-node`** if it is in your `package.json`.
2. **Use `onnxruntime-web` ONLY.**

## 🚀 Action Plan
1. **Commit and Push** the changes I just made to `next.config.js`.
2. **Redeploy** on Vercel.
