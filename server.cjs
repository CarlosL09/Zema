const express = require("express");
const fs = require("fs");
const path = require("path");
const log = (message) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [express] ${message}`);
};
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Serve static assets with proper content types
app.use("/assets", express.static(path.join(__dirname, "assets"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));
// Log available files for debugging
try {
  const files = fs.readdirSync(__dirname);
  log(`📋 Available files in root: ${files.slice(0, 10).join(", ")}${files.length > 10 ? '...' : ''}`);
  
  const assetsPath = path.join(__dirname, "assets");
  if (fs.existsSync(assetsPath) && fs.statSync(assetsPath).isDirectory()) {
    const assetFiles = fs.readdirSync(assetsPath);
    log(`📋 Available assets: ${assetFiles.join(", ")}`);
  } else {
    log(`⚠️ Assets directory not found or not a directory: ${assetsPath}`);
  }
} catch (err) {
  log(`⚠️ Could not read directory: ${err.message}`);
}
// Health check endpoint
app.get("/api/health", (req, res) => {
  log("🏥 Health check requested");
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    message: "ZEMA server is running",
    port: process.env.PORT || 8080
  });
});
// Root route - serve React app
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  
  if (fs.existsSync(indexPath)) {
    log(`📄 Serving React app from: ${indexPath}`);
    res.sendFile(path.resolve(indexPath));
    return;
  }
  
  log(`⚠️ No index.html found at: ${indexPath}`);
  res.status(404).send("index.html not found");
});
// Catch-all for React Router (exclude asset requests)
app.get("*", (req, res) => {
  // Don't intercept asset requests
  if (req.path.startsWith('/assets/')) {
    return res.status(404).send('Asset not found');
  }
  
  // Serve React app for all other routes
  const indexPath = path.join(__dirname, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(path.resolve(indexPath));
  } else {
    res.status(404).send("Application not found");
  }
});
// Graceful error handling for port conflicts
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, '0.0.0.0', () => {
  log(`🚀 ZEMA server running on port ${PORT}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    log(`⚠️ Port ${PORT} is already in use, trying to shut down gracefully`);
    process.exit(1);
  } else {
    log(`❌ Server error: ${err.message}`);
    throw err;
  }
});
// Graceful shutdown
process.on('SIGTERM', () => {
  log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('✅ Server closed');
    process.exit(0);
  });
});
process.on('SIGINT', () => {
  log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    log('✅ Server closed');
    process.exit(0);
  });
});
