# 3D AI Avatar Room

A 3D interactive room with an AI-powered avatar using Three.js and OpenAI API, featuring a 90s pixel art aesthetic.

## Features

- **3D Environment**: Interactive 3D room built with Three.js
- **AI Chat**: Powered by OpenAI's GPT-4.1 model
- **Dynamic Generation**: DALL-E generated pixel art environments and avatars
- **Retro Aesthetic**: 90s cyberpunk style with neon colors
- **Secure API**: Server-side API key handling

## Prerequisites

- Node.js (v14 or higher)
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Senn-01/3d-ai-avatar-room.git
cd 3d-ai-avatar-room
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Click "GENERATE WORLD" to create the AI-generated environment and avatar

4. Start chatting with the AI avatar using the chat interface

## Technologies Used

- **Three.js**: 3D graphics library
- **OpenAI API**: GPT-4.1 for chat, DALL-E for image generation
- **Express.js**: Node.js web framework
- **90s Pixel Art**: Retro gaming aesthetic

## License

MIT