const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('Please set OPENAI_API_KEY in your .env file');
    process.exit(1);
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4.1',
            messages: [
                { role: 'system', content: 'You are a helpful AI assistant in a 90s pixel art style 3D virtual room. Keep responses concise and friendly with a retro gaming vibe.' },
                { role: 'user', content: message }
            ],
            max_tokens: 150
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Chat error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to get response from AI' });
    }
});

app.post('/api/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            model: 'dall-e-3',
            prompt: `${prompt}, 90s pixel art style, retro gaming aesthetic, low resolution pixelated graphics, vibrant colors`,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid'
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ imageUrl: response.data.data[0].url });
    } catch (error) {
        console.error('Image generation error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate image' });
    }
});

app.get('/api/generate-environment', async (req, res) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            model: 'dall-e-3',
            prompt: 'Futuristic cyberpunk room interior, 90s pixel art style, retro gaming aesthetic, neon lights, computer terminals, low resolution pixelated graphics, vibrant purple and cyan colors, isometric view',
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid'
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ imageUrl: response.data.data[0].url });
    } catch (error) {
        console.error('Environment generation error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate environment' });
    }
});

app.get('/api/generate-avatar', async (req, res) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            model: 'dall-e-3',
            prompt: 'Friendly AI robot avatar, 90s pixel art style, retro gaming character, 16-bit graphics, simple geometric shapes, bright colors, facing forward, transparent background',
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid'
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ imageUrl: response.data.data[0].url });
    } catch (error) {
        console.error('Avatar generation error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to generate avatar' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});