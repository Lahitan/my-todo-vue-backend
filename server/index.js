require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Removed: const fetch = require('node-fetch'); // Not needed for Node.js v18+

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Enable JSON body parsing

// --- API Key Check (Backend) ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in the server/.env file.');
  // For production, you might want to gracefully shut down or return errors
}

// Proxy endpoint for Gemini API
app.post('/api/gemini-motivation', async (req, res) => {
  try {
    // Ensure the API Key is available
    if (!GEMINI_API_KEY) {
      return res
        .status(500)
        .json({ error: 'Gemini API Key is not configured on the server.' });
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Forward the request body from the frontend
      body: JSON.stringify(req.body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || 'Failed to fetch from Gemini API',
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Server error during Gemini API proxy:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Basic route for testing server status
app.get('/', (req, res) => {
  res.send('Gemini Proxy Server is running.');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
