const express = require("express");
const path = require("path");
const fs = require("fs");

// Simple production logging
function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Railway
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "ZEMA is running", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    version: "1.0.0"
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Static file serving
const distPath = path.join(__dirname, "..", "dist", "public");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  log(`Serving static files from: ${distPath}`);
} else {
  log(`Warning: Static files not found at ${distPath}`);
}

// Fallback for SPA routing
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <html>
        <head><title>ZEMA</title></head>
        <body>
          <h1>ZEMA - Zero Effort Mail Automation</h1>
          <p>Application is running successfully!</p>
          <p>Build directory: ${distPath}</p>
          <p>Environment: ${process.env.NODE_ENV || "production"}</p>
        </body>
      </html>
    `);
  }
});

// Error handling
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${status} - ${message}`);
  res.status(status).json({ message });
});

// Start server - Railway requires PORT env var and 0.0.0.0 binding
const port = process.env.PORT || 3000;
const server = app.listen(port, "0.0.0.0", () => {
  log(`ZEMA serving on port ${port}`);
  log(`Environment: ${process.env.NODE_ENV || "production"}`);
  log(`Health check: http://0.0.0.0:${port}/`);
  log(`Server ready for Railway health checks`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('Process terminated');
  });
});