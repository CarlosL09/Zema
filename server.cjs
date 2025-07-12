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
// IMPORTANT: Serve static assets FIRST, before any other routes
app.use("/assets", express.static(path.join(__dirname, "assets"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));
// Log available files for debugging
try {
  const files = fs.readdirSync(__dirname);
  log(`📋 Available files in root: ${files.join(", ")}`);
  
  const assetsPath = path.join(__dirname, "assets");
  if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath);
    log(`📋 Available assets: ${assetFiles.join(", ")}`);
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
    message: "ZEMA server is running"
  });
});
// Root route - serve index.html for React app
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
// Catch-all route for React Router (only for non-asset requests)
app.get("*", (req, res) => {
  // Don't catch asset requests
  if (req.path.startsWith('/assets/')) {
    return res.status(404).send('Asset not found');
  }
  
  const indexPath = path.join(__dirname, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(path.resolve(indexPath));
  } else {
    res.status(404).send("Application not found");
  }
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  log(`🚀 ZEMA server running on port ${PORT}`);
});

app.listen(PORT, "0.0.0.0", () => {
  log(`🚀 ZEMA Server running on port ${PORT}`);
  log(`🌐 Environment: ${process.env.NODE_ENV || "production"}`);
  log(`📁 Serving from: ${__dirname}`);
});
