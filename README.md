# Miko3 Headless Voice Assistant

A standalone NLP & Speech server using [NLP.js](https://github.com) and [Vosk](https://alphacephei.com).

## 🛠️ Server Setup
1. Place your training data in `corpus-en.json`.
2. Download a model from [Vosk Models](https://alphacephei.commodels) and unzip to a folder named `/model`.
3. Start: `node server.js`

## 🔌 How to Build a Client
The server runs on [Socket.io](https://socket.io) at port `3000`.

### Option A: Audio Client (Voice)
1. Capture audio at **16kHz, Mono, 16-bit PCM**.
2. Emit raw buffers to the `audio-data` event.
3. Listen for `voice-output` to receive the response.

### Option B: Text Client (Chat)
1. Emit a string to the `text-input` event.
2. The server responds with a JSON object: `{ "text": "input", "answer": "response" }`.

### Python Client Example
```python
import socketio
sio = socketio.Client()
sio.connect('http://localhost:3000')
sio.emit('text-input', 'hello')
@sio.on('voice-output')
def on_message(data):
    print(f"Assistant: {data['answer']}")
