const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;
// Parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// CRITICAL: Serve ALL static files from root directory
app.use(express.static(__dirname, {
  index: false,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});
// ONLY serve index.html for non-asset, non-API routes
app.get('*', (req, res) => {
  // Don't intercept asset requests or API calls
  if (req.path.startsWith('/assets/') || req.path.startsWith('/api/')) {
    return res.status(404).send('Not found');
  }
  
  // Serve React app for all other routes
  const indexPath = path.join(__dirname, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found');
  }
});
// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ZEMA server running on port ${PORT}`);
});
