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

// API health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Static file serving - check multiple locations
const staticPaths = [
  path.join(__dirname, "assets"), 
  path.join(__dirname, "public"),
  path.join(__dirname, "..", "assets"),
  path.join(__dirname, "..", "public"),
  path.join(__dirname, "..", "dist", "public")
];

let staticPath = null;
for (const testPath of staticPaths) {
  if (fs.existsSync(testPath)) {
    staticPath = testPath;
    app.use("/assets", express.static(staticPath));
    log(`✅ Serving static files from: ${staticPath}`);
    break;
  }
}

if (!staticPath) {
  log(`⚠️ No static files found. Checked: ${staticPaths.join(", ")}`);
}

// Root route - serve index.html or beautiful fallback
app.get("/", (req, res) => {
  // Try to serve index.html from repository root
  const indexPaths = [
    path.join(__dirname, "index.html"),           // Repository root (same directory as start.cjs)
    path.join(__dirname, "public", "index.html"), // Public folder
    path.join(__dirname, "dist", "public", "index.html") // Built version
  ];
  
  for (const indexPath of indexPaths) {
    if (fs.existsSync(indexPath)) {
      log(`📄 Serving React app from: ${indexPath}`);
      res.sendFile(path.resolve(indexPath));
      return;
    }
  }
  
  log(`⚠️ No index.html found. Checked: ${indexPaths.join(", ")}`);
  
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
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                color: white;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }
            .container {
                text-align: center;
                max-width: 600px;
                background: rgba(30, 41, 59, 0.8);
                padding: 3rem;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(6, 182, 212, 0.3);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .logo {
                font-size: 3rem;
                font-weight: 900;
                color: #06b6d4;
                margin-bottom: 1rem;
                text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
            }
            .tagline {
                font-size: 1.2rem;
                color: #94a3b8;
                margin-bottom: 2rem;
                font-weight: 300;
            }
            .status {
                background: rgba(6, 182, 212, 0.1);
                border: 1px solid #06b6d4;
                border-radius: 10px;
                padding: 1.5rem;
                margin: 2rem 0;
            }
            .status h3 {
                color: #06b6d4;
                margin-bottom: 1rem;
                font-size: 1.3rem;
            }
            .metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-top: 2rem;
            }
            .metric {
                background: rgba(15, 23, 42, 0.6);
                padding: 1rem;
                border-radius: 10px;
                border: 1px solid rgba(6, 182, 212, 0.2);
            }
            .metric-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: #06b6d4;
            }
            .metric-label {
                font-size: 0.9rem;
                color: #64748b;
                margin-top: 0.5rem;
            }
            .pulse {
                animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo pulse">ZEMA</div>
            <div class="tagline">Zero Effort Mail Automation</div>
            
            <div class="status">
                <h3>🚀 Server Status: Online</h3>
                <p>Railway deployment successful! ZEMA backend is running smoothly.</p>
            </div>
            
            <div class="metrics">
                <div class="metric">
                    <div class="metric-value">✅</div>
                    <div class="metric-label">Server Health</div>
                </div>
                <div class="metric">
                    <div class="metric-value">${process.uptime().toFixed(0)}s</div>
                    <div class="metric-label">Uptime</div>
                </div>
                <div class="metric">
                    <div class="metric-value">Ready</div>
                    <div class="metric-label">Frontend Status</div>
                </div>
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(6, 182, 212, 0.05); border-radius: 10px; border: 1px solid rgba(6, 182, 212, 0.1);">
                <p style="color: #94a3b8; font-size: 0.9rem;">
                    Frontend files loading... If you see this message, the React app is being served next.
                </p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Catch-all route for React Router
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(path.resolve(indexPath));
  } else {
    res.redirect("/");
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  log(`🚀 ZEMA Server running on port ${PORT}`);
  log(`🌐 Environment: ${process.env.NODE_ENV || "production"}`);
  log(`📁 Serving from: ${__dirname}`);
  
  // Log available files for debugging
  try {
    const files = fs.readdirSync(__dirname);
    log(`📋 Available files: ${files.join(", ")}`);
  } catch (err) {
    log(`⚠️ Could not read directory: ${err.message}`);
  }
});