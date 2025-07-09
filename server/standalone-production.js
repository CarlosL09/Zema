import express from "express";
import path from "path";
import fs from "fs";

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

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Basic health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "ZEMA is running", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production"
  });
});

// Basic API endpoints for testing
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.get("/api/status", (req, res) => {
  res.json({ 
    status: "running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "production"
  });
});

// Simple static file serving for production
function serveStatic(app) {
  // In Docker, we're in /app, static files are in /app/dist/public
  const distPath = "/app/dist/public";

  if (!fs.existsSync(distPath)) {
    log(`Warning: Build directory not found at ${distPath}`);
    // Create a simple fallback response
    app.use("*", (_req, res) => {
      res.status(200).send(`
        <html>
          <head><title>ZEMA</title></head>
          <body>
            <h1>ZEMA is starting...</h1>
            <p>Static files loading...</p>
            <p>Build directory: ${distPath}</p>
          </body>
        </html>
      `);
    });
    return;
  }

  app.use(express.static(distPath));

  // Fallback to index.html
  app.use("*", (_req, res) => {
    const indexPath = path.join(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`
        <html>
          <head><title>ZEMA</title></head>
          <body>
            <h1>ZEMA</h1>
            <p>Application is running but static files are not available.</p>
            <p>Looking for: ${indexPath}</p>
          </body>
        </html>
      `);
    }
  });
}

// Error handling middleware
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${status} - ${message}`);
  res.status(status).json({ message });
});

// Serve static files
serveStatic(app);

// Start server
const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
app.listen(port, "0.0.0.0", () => {
  log(`ZEMA serving on port ${port}`);
  log(`Environment: ${process.env.NODE_ENV || "production"}`);
  log(`Health check available at: http://localhost:${port}/`);
});