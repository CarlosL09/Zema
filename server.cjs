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

// Serve static files from assets directory
app.use("/assets", express.static(path.join(__dirname, "assets")));

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

// Root route - serve index.html or beautiful fallback
app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  
  if (fs.existsSync(indexPath)) {
    log(`📄 Serving React app from: ${indexPath}`);
    res.sendFile(path.resolve(indexPath));
    return;
  }
  
  log(`⚠️ No index.html found at: ${indexPath}`);
  
  // Beautiful ZEMA landing page fallback
  res.send(`
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
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container { 
                text-align: center; 
                max-width: 600px; 
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            h1 { 
                font-size: 3rem; 
                margin-bottom: 1rem; 
                background: linear-gradient(45deg, #00f5ff, #0099ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            p { 
                font-size: 1.2rem; 
                margin-bottom: 2rem; 
                opacity: 0.9;
            }
            .status {
                padding: 1rem;
                background: rgba(0, 255, 255, 0.1);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 10px;
                margin: 1rem 0;
            }
            .pulse {
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1 class="pulse">ZEMA</h1>
            <p>Zero Effort Mail Automation</p>
            <div class="status">
                <p>🚀 Server is running successfully!</p>
                <p>⚡ Production environment ready</p>
                <p>📧 Email automation platform deployed</p>
            </div>
            <p>Your intelligent email management system is online and ready to optimize your communication workflow.</p>
        </div>
    </body>
    </html>
  `);
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Production API fallback (shouldn't show in browser)
app.get("/api*", (req, res) => {
  res.json({
    message: "ZEMA API is running",
    timestamp: new Date().toISOString(),
    environment: "production",
    version: "1.0.0"
  });
});

// Catch-all route
app.get("*", (req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(path.resolve(indexPath));
  } else {
    res.redirect("/");
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  log(`🚀 ZEMA Server running on port ${PORT}`);
  log(`🌐 Environment: ${process.env.NODE_ENV || "production"}`);
  log(`📁 Serving from: ${__dirname}`);
});