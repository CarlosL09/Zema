# Railway Deployment Trigger

This file forces Railway to rebuild without using cached layers.

**Build Timestamp**: 2025-01-11 21:54 UTC
**Trigger Reason**: MINIMAL DOCKERFILE - NO BUILD COMPLEXITY
**Changes**: 
- Replaced complex Dockerfile with minimal approach
- Skips npm run build step that was causing issues
- Uses pre-built static files from dist/ folder
- Server tested locally: responds at / and /api/health endpoints
- Simple alpine image with only production dependencies
- Direct node server.cjs startup

**Expected Result**: Fast, reliable deployment without build failures