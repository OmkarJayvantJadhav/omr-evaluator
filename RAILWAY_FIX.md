# Railway Deployment Fix

## 🐛 Issue: PORT Environment Variable Not Working

**Error Message:**
```
Error: Invalid value for '--port': '$PORT' is not a valid integer.
```

## 🔧 Root Cause
1. Docker CMD was using exec form `["uvicorn", ...]` which doesn't expand environment variables
2. railway.json had conflicting `startCommand` that also couldn't expand `$PORT`

## ✅ Fixes Applied

### 1. Fixed Dockerfile CMD
**Before:**
```dockerfile
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**After:**
```dockerfile
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### 2. Updated Health Check
**Before:**
```dockerfile
CMD curl -f http://localhost:8000/health || exit 1
```

**After:**
```dockerfile
CMD curl -f http://localhost:${PORT:-8000}/health || exit 1
```

### 3. Removed Conflicting startCommand from railway.json
**Before:**
```json
{
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health",
    ...
  }
}
```

**After:**
```json
{
  "deploy": {
    "healthcheckPath": "/health",
    ...
  }
}
```

## 🚀 How to Deploy the Fix

1. **Commit the changes:**
   ```bash
   git add .
   git commit -m "Fix Railway PORT environment variable issue"
   git push origin main
   ```

2. **Redeploy on Railway:**
   - Go to your Railway project
   - The deployment should automatically trigger
   - Check the logs for successful startup

3. **Verify the fix:**
   - Check Railway logs for: `Uvicorn running on http://0.0.0.0:[PORT]`
   - Visit your Railway app URL
   - Test the `/health` endpoint

## 💡 Technical Explanation

**Shell Form vs Exec Form:**
- **Exec Form** `["cmd", "arg"]` - Does NOT expand environment variables
- **Shell Form** `cmd arg` - DOES expand environment variables via shell

Railway sets the `PORT` environment variable dynamically, so we need shell form to expand `${PORT:-8000}` (use PORT if set, otherwise default to 8000).

## ✅ Expected Result

After the fix, you should see in Railway logs:
```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:XXXX (Press CTRL+C to quit)
```

Where `XXXX` is the port Railway assigns (usually in 5000-8000 range).