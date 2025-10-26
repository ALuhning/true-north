import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function serveFrontend(app: express.Application) {
  // Serve static files from the dist directory
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // All other routes should serve index.html (for client-side routing)
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
