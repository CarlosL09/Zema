# Railway Deployment Trigger

This file forces Railway to rebuild without using cached layers.

**Build Timestamp**: 2025-01-09 19:48 UTC
**Trigger Reason**: Force rebuild with new Dockerfile structure
**Changes**: 
- New working directory `/zema-app`
- Standalone production server at `dist/production-server.js`
- No esbuild bundling - direct file copy
- Added security hardening with non-root user

**Expected Result**: Successful deployment with health checks passing