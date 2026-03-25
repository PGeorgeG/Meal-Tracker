const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD || '';

const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

// Basic password protection via query param or cookie
app.use((req, res, next) => {
  if (!APP_PASSWORD) return next(); // no password set, open access

  // Check cookie
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
  if (cookies['etr_auth'] === APP_PASSWORD) return next();

  // Check query param ?p=password (sets cookie then redirects)
  if (req.query.p === APP_PASSWORD) {
    res.setHeader('Set-Cookie', `etr_auth=${APP_PASSWORD}; Path=/; HttpOnly; Max-Age=2592000`);
    return res.redirect('/');
  }

  // Show simple password form
  res.setHeader('Content-Type', 'text/html');
  res.status(401).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Earn The Ride</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f0e0c; color: #f0ead8; font-family: 'DM Sans', sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .box { background: #1a1916; border: 1px solid #2e2b26; border-radius: 16px;
           padding: 36px 32px; width: 320px; text-align: center; }
    h1 { font-family: Georgia, serif; font-size: 24px; color: #e8c547; margin-bottom: 8px; }
    p { font-size: 13px; color: #7a7060; margin-bottom: 24px; letter-spacing: 0.5px; }
    input { width: 100%; background: #0f0e0c; border: 1px solid #2e2b26; border-radius: 8px;
            color: #f0ead8; font-size: 15px; padding: 12px 14px; outline: none;
            text-align: center; letter-spacing: 2px; margin-bottom: 14px; }
    button { width: 100%; background: #e8c547; color: #1a1600; border: none; border-radius: 8px;
             font-size: 15px; font-weight: 600; padding: 13px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Earn The Ride</h1>
    <p>eat well. earn the ride.</p>
    <form method="GET" action="/">
      <input type="password" name="p" placeholder="password" autofocus />
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`);
});

app.get('*', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  const injected = html.replace(
    '<!-- __API_KEY_INJECT__ -->',
    apiKey ? `<script>window.__ANTHROPIC_API_KEY__ = ${JSON.stringify(apiKey)};</script>` : ''
  );
  res.setHeader('Content-Type', 'text/html');
  res.send(injected);
});

app.listen(PORT, () => console.log(`Earn The Ride running on port ${PORT}`));
