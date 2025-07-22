'use client';

import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const abortController = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    const res = await fetch('http://localhost:5000/api/chats');
    const data = await res.json();
    setChats(data);
  };

  const fetchMessages = async (chatId) => {
    const res = await fetch(`http://localhost:5000/api/chat/${chatId}`);
    const data = await res.json();
    setMessages(data);
    setSelectedChatId(chatId);
  };

  const createNewChat = async () => {
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
    });
    const chat = await res.json();
    await fetchChats();
    setMessages([]);
    setSelectedChatId(chat.id);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedChatId) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    abortController.current = new AbortController();

    const response = await fetch(`http://localhost:5000/api/chat/${selectedChatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ message: input }),
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.current.signal,
    });

    if (!response.ok || !response.body) {
      setIsStreaming(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMsg = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(true);
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(Boolean);

      for (let line of lines) {
        if (line.startsWith('data:')) {
          const token = line.replace('data:', '');
          assistantMsg.content += token;

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { ...assistantMsg };
            return updated;
          });
        }
      }
    }

    setIsStreaming(false);
    setIsTyping(false);

  };
  const stopStreaming = async () => {
    if (abortController.current && selectedChatId) {
      await fetch(`http://localhost:5000/api/chat/${selectedChatId}/stop`, {
        method: 'POST',
      });
      abortController.current.abort();
      setIsStreaming(false);
    }
  };
 const bottomRef = useRef(null);

useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);
  return (
    <div className="flex flex-row justify-stretch min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white p-4 shadow-md">
        <div className="flex flex-col mb-4">
          <button
            onClick={createNewChat}
            className="w-[300px] p-2 border bg-black text-white rounded-md"
          >
            New Chat
          </button>
          <h2 className="mt-6 text-gray-600">Chat history</h2>
          <ul className="mt-2 space-y-2">
            {chats.map((chat) => (
              <li key={chat.id}>
                <div 
                onClick={() => fetchMessages(chat.id)}
                className={`p-2 flex flex-row items-center justify-between hover:bg-gray-50 rounded-md cursor-pointer
                  ${selectedChatId === chat.id ? 'bg-gray-200 font-semibold' : ''}
                  `}>
                
                  {chat.title || 'Untitled Chat'}
                
                <span className="ml-2 text-sm"> {new Date(chat.createdAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}</span>
        </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 p-4">
        <div className="flex flex-col justify-between h-full">
          <h1 className="text-2xl text-center font-bold mb-4">Welcome to AI Chat Bot</h1>

         <div className="flex flex-col gap-2 h-[70vh] overflow-y-auto bg-white p-4 shadow rounded-md mb-4">
            {messages.map((msg, i) => (
              <div
  key={i}
  className={`p-2 max-w-[85%] whitespace-pre-wrap break-words rounded-md ${
    msg.role === 'user' ? 'self-end bg-blue-100 text-right' : 'self-start bg-gray-200 text-left'
  }`}
>
  <p className="text-sm text-gray-700">
    <span className="font-semibold block">{msg.role === 'user' ? 'You' : 'Bot'}:</span>
    {msg.content}
  </p>
</div>
            ))}
          </div>
          {isTyping && (
  <div className="text-sm text-gray-500 italic mb-2">
    Bot is typing...
  </div>
)}
       <div ref={bottomRef}></div>
          <div className="flex items-center bg-white p-2 shadow-md rounded-lg">
            <input
              type="text"
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <button
              className="ml-2 p-2 border bg-black text-white rounded-md cursor-pointer"
              onClick={sendMessage}
              disabled={isStreaming}
            >
              Send
            </button>
            {isStreaming && (
              <button
                className="ml-2 p-2 border bg-red-600 text-white rounded-md cursor-pointer"
                onClick={stopStreaming}
              >
                Stop
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
