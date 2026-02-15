const fs = require('fs');
const { NlpManager } = require('node-nlp');
const { Server } = require('socket.io');
const http = require('http');
const vosk = require('vosk');

// Setup NLP.js
const manager = new NlpManager({ languages: ['en'], forceNER: true });
const modelPath = './model.nlp';

// Setup Vosk (Offline STT)
vosk.setLogLevel(-1);
if (!fs.existsSync('model')) {
    console.error('Please download a Vosk model and name it "model"');
    process.exit(1);
}
const voskModel = new vosk.Model('model');
const rec = new vosk.Recognizer({ model: voskModel, sampleRate: 16000 });

// Headless Server
const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: { origin: "*" } // Allows any client to connect
});

(async () => {
    // Persistent Brain Logic
    if (fs.existsSync(modelPath)) {
        await manager.load(modelPath);
    } else {
        await manager.addCorpus('./corpus-en.json');
        await manager.train();
        manager.save(modelPath);
    }

    io.on('connection', (socket) => {
        console.log(`Client Connected: ${socket.id}`);

        // Binary Audio Stream Handler
        socket.on('audio-data', (data) => {
            if (rec.acceptWaveform(data)) {
                const result = rec.result().text;
                if (result) handleText(socket, result);
            }
        });

        // Text Fallback (for text-only clients)
        socket.on('text-input', (text) => handleText(socket, text));
    });

    async function handleText(socket, text) {
        const response = await manager.process('en', text);
        socket.emit('voice-output', {
            text: text,
            answer: response.answer || "No intent matched."
        });
    }

    httpServer.listen(3000, () => console.log('Miko3 Headless Server: Port 3000'));
})();
