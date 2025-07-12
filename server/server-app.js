const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());

// Serve static files from assets directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

// Root route - serve React app
app.get("/", (req, res) => {
  // Check for index.html in repository root
  const indexPath = path.join(__dirname, "..", "index.html");
  
  if (fs.existsSync(indexPath)) {
    console.log(`Serving React app from: ${indexPath}`);
    res.sendFile(path.resolve(indexPath));
    return;
  }
  
  // Debug information
  const debugInfo = {
    message: "ZEMA Debug Info",
    workingDir: __dirname,
    repoRoot: path.join(__dirname, ".."),
    indexPath: indexPath,
    indexExists: fs.existsSync(indexPath),
    assetsPath: path.join(__dirname, "..", "assets"),
    assetsExists: fs.existsSync(path.join(__dirname, "..", "assets")),
    timestamp: new Date().toISOString()
  };
  
  console.log("Debug info:", debugInfo);
  res.json(debugInfo);
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// SPA fallback
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "..", "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(path.resolve(indexPath));
  } else {
    res.redirect("/");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`ZEMA server running on port ${port}`);
  console.log(`Looking for files in: ${path.join(__dirname, "..")}`);
});