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

// Serve index.html for the root route
app.get("/", (req, res) => {
  const possiblePaths = [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "public", "index.html"),
    path.join(__dirname, "..", "dist", "public", "index.html")
  ];
  
  for (const indexPath of possiblePaths) {
    if (fs.existsSync(indexPath)) {
      log(`📄 Serving index.html from: ${indexPath}`);
      res.sendFile(path.resolve(indexPath));
      return;
    }
  }
  
  // Beautiful fallback landing page
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ZEMA - Zero Effort Mail Automation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0; padding: 0;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
          color: white; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
        }
        .container { text-align: center; padding: 40px; max-width: 600px; }
        .logo { font-size: 4rem; font-weight: bold; color: #22d3ee; margin-bottom: 20px; text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
        .tagline { font-size: 1.5rem; margin-bottom: 30px; color: #94a3b8; }
        .status { background: rgba(34, 211, 238, 0.1); border: 1px solid #22d3ee; border-radius: 10px; padding: 20px; margin: 30px 0; }
        .status h3 { color: #22d3ee; margin-top: 0; }
        .button { background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin: 10px; transition: transform 0.2s; }
        .button:hover { transform: translateY(-2px); }
        .info { margin-top: 30px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🚀 ZEMA</div>
        <div class="tagline">Zero Effort Mail Automation</div>
        <div class="status">
          <h3>✅ Railway Deployment Successful!</h3>
          <p>Your ZEMA application is running on Railway</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV || "production"}</p>
          <p><strong>Port:</strong> ${process.env.PORT || 3000}</p>
        </div>
        <div>
          <a href="/api/health" class="button">Health Check</a>
        </div>
        <div class="info">
          <p><strong>Demo Login:</strong> demo@zema.com / demo123</p>
          <p><strong>Admin Access:</strong> admin@zema.com / Luna0906!</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// SPA fallback for all other routes
app.get("*", (req, res) => {
  const possiblePaths = [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "public", "index.html"),
    path.join(__dirname, "..", "dist", "public", "index.html")
  ];
  
  for (const indexPath of possiblePaths) {
    if (fs.existsSync(indexPath)) {
      res.sendFile(path.resolve(indexPath));
      return;
    }
  }
  
  // Redirect to home page
  res.redirect("/");
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