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

// Root route - serve index.html or beautiful fallback
app.get("/", (req, res) => {
  // Try to serve index.html from static locations
  const indexPaths = [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "public", "index.html"),
    path.join(__dirname, "..", "dist", "public", "index.html"),
    path.join(__dirname, "..", "index.html")
  ];
  
  for (const indexPath of indexPaths) {
    if (fs.existsSync(indexPath)) {
      log(`📄 Serving React app from: ${indexPath}`);
      res.sendFile(path.resolve(indexPath));
      return;
    }
  }
  
  // Beautiful ZEMA landing page fallback
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ZEMA - Zero Effort Mail Automation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white; min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
        }
        .container { text-align: center; max-width: 600px; padding: 2rem; }
        .logo { font-size: 4rem; font-weight: bold; color: #22d3ee; margin-bottom: 1rem; text-shadow: 0 0 30px rgba(34, 211, 238, 0.5); }
        .tagline { font-size: 1.5rem; color: #94a3b8; margin-bottom: 2rem; }
        .status { background: rgba(34, 211, 238, 0.1); border: 1px solid #22d3ee; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; }
        .status h3 { color: #22d3ee; margin-bottom: 1rem; }
        .btn { background: linear-gradient(135deg, #22d3ee, #0891b2); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin: 10px; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); }
        .info { margin-top: 2rem; color: #64748b; }
        .credentials { background: rgba(0, 0, 0, 0.3); border-radius: 8px; padding: 1rem; margin-top: 1rem; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">🚀 ZEMA</div>
        <div class="tagline">Zero Effort Mail Automation</div>
        <div class="status">
          <h3>✅ Railway Deployment Successful!</h3>
          <p>Environment: ${process.env.NODE_ENV || "production"}</p>
          <p>Port: ${process.env.PORT || 3000}</p>
          <p>Static files: ${staticPath || "Built-in fallback"}</p>
        </div>
        <div>
          <a href="/api/health" class="btn">Health Check</a>
        </div>
        <div class="info">
          <p><strong>Demo Credentials</strong></p>
          <div class="credentials">
            <p>User: demo@zema.com / demo123</p>
            <p>Admin: admin@zema.com / Luna0906!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Static file serving - check multiple locations
const staticPaths = [
  path.join(__dirname, "public"),
  path.join(__dirname, "assets"), 
  path.join(__dirname, "..", "dist", "public"),
  path.join(__dirname, "..", "public")
];

let staticPath = null;
for (const testPath of staticPaths) {
  if (fs.existsSync(testPath)) {
    staticPath = testPath;
    app.use(express.static(staticPath));
    log(`✅ Serving static files from: ${staticPath}`);
    break;
  }
}

if (!staticPath) {
  log(`⚠️ No static files found. Checked: ${staticPaths.join(", ")}`);
}

// SPA fallback for all other routes  
app.get("*", (req, res) => {
  // Try to serve index.html for React routing
  const indexPaths = [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "public", "index.html"),
    path.join(__dirname, "..", "dist", "public", "index.html"),
    path.join(__dirname, "..", "index.html")
  ];
  
  for (const indexPath of indexPaths) {
    if (fs.existsSync(indexPath)) {
      res.sendFile(path.resolve(indexPath));
      return;
    }
  }
  
  // Redirect to home page if no React app found
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