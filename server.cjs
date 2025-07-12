const express = require("express");
const path = require("path");
const app = express();
// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Serve static assets - CRITICAL: This must come before any other routes
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  // Set proper content types
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString() 
  });
});
// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  res.sendFile(indexPath);
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`ZEMA server running on port ${PORT}`);
});
