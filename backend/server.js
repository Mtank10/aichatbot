const express = require('express');
const cors = require('cors');
const {PrismaClient} = require('@prisma/client');
const bodyParser = require('body-parser');
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors(
    {origin: 'http://localhost:3000', 
}
))

app.use(bodyParser.json());

let abortControllerMap = {};

app.post('/api/chat', async (req, res) => {
    try {
        const chat = await prisma.chats.create({data:{title: 'New Chat'}});
        res.status(200).json(chat);
    }
    catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

app.post('/api/chat/:chatId/message',async (req,res)=>{
    const {chatId} = req.params;
    const {message} = req.body;
    try {
        await prisma.chats.update({
        where: { id: chatId },
        data: { title: message.slice(0, 10) },
      });
        const userMessage = await prisma.messages.create({
            data:{chat_id:chatId,role:'user',content:message}
        })
    
        const controller = new AbortController();
  abortControllerMap[chatId] = controller;
    res.setHeader('Content-Type', 'text/event-stream');
     res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
    const response = await fetch('http://localhost:11434/api/generate',{
    method: 'POST',
    signal: controller.signal,
    body: JSON.stringify({
        model:'gemma3:1b',
        prompt:message,
        stream: true,
    }),
    headers: {
        'Content-Type': 'application/json',
    },
  })
      if (!response.ok) {
            throw new Error('Failed to fetch response from the API');   
      }
   const reader = response.body.getReader();
   const decoder = new TextDecoder();
   let content= '';
   const read = async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      try {
        const lines = chunk.trim().split('\n');
        for (let line of lines) {
          const parsed = JSON.parse(line);
          content += parsed.response;
          res.write(`data: ${parsed.response}\n\n`);
        }
      } catch (_) {}
    }
      await prisma.messages.create({
        data: {
          chat_id: chatId,
          role: "assistant",
          content,
        },
      });
       
      res.end();
    
  };

  await read();

  }
    catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

app.post('/api/chat/:chatId/stop',(req,res)=>{
    const {chatId} = req.params;
    if (abortControllerMap[chatId]) {
    abortControllerMap[chatId].abort();
    delete abortControllerMap[chatId];
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }

})

app.get('/api/chats', async (req, res) => {
  const chats = await prisma.chats.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(chats);
});

app.get('/api/chat/:chatId', async (req, res) => {
  const messages = await prisma.messages.findMany({
    where: { chat_id: req.params.chatId },
    orderBy: { timestamp: 'asc' },
  });
  res.json(messages);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});