// index.js
const express = require('express');
const app = express();

// Port von Render kommt aus process.env.PORT, fallback auf 3001 (lokal)
const PORT = process.env.PORT || 3001;

// Eine Test-Route
app.get('/', (req, res) => {
  res.send('Hallo duda, from Node.js via Express!');
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
