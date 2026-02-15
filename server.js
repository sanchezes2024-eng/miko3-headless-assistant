const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { NlpManager } = require('node-nlp');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const manager = new NlpManager({ languages: ['en'], forceNER: true });
const modelPath = './model.nlp';

(async () => {
  // Check if we can skip training
  if (fs.existsSync(modelPath)) {
    console.log('Model found. Loading...');
    await manager.load(modelPath);
  } else {
    console.log('No model. Training from corpus...');
    await manager.addCorpus('./corpus-en.json');
    await manager.train();
    manager.save(modelPath);
  }

  app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

  io.on('connection', (socket) => {
    socket.on('voice-input', async (text) => {
      const result = await manager.process('en', text);
      socket.emit('voice-output', result.answer || "I'm not sure how to answer that.");
    });
  });

  server.listen(3000, () => console.log('Assistant on http://localhost:3000'));
})();
