const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

app.get('*', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  const injected = html.replace(
    '<!-- __API_KEY_INJECT__ -->',
    apiKey ? `<script>window.__ANTHROPIC_API_KEY__ = ${JSON.stringify(apiKey)};</script>` : ''
  );
  res.setHeader('Content-Type', 'text/html');
  res.send(injected);
});

app.listen(PORT, () => console.log(`Mise en Bouche running on port ${PORT}`));
