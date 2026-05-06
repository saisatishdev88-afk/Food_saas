'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import api from '@/api/client';
import { useToast } from '@/components/ui/Toast';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your AI Assistant. I can analyze sales, identify slow-moving items, or help you generate operational reports. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { success, error } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await api.post('/tenant/ai/chat', { message });
      return res.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Sorry, I encountered an error communicating with the network.';
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
    }
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tenant/ai/report');
      return res.data;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      success('Operational report generated and broadcasted.');
    },
    onError: () => {
      error('Failed to generate operational report.');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    chatMutation.mutate(userMessage);
  };

  return (
    <div className="p-8 lg:p-12 max-w-[1200px] mx-auto w-full space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/5 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-on-surface font-headline uppercase italic">AI <span className="text-primary italic">Intelligence</span></h2>
          <p className="text-on-surface-variant font-medium text-sm opacity-50">Query your restaurant's data matrix in natural language.</p>
        </div>
        <Button 
            onClick={() => reportMutation.mutate()}
            disabled={reportMutation.isPending}
            className="bg-emerald-50 text-emerald-700 px-6 h-12 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-sm hover:bg-emerald-100 transition-all active:scale-95 border border-emerald-200 flex items-center gap-2"
        >
            <span className="material-symbols-outlined text-sm">mark_email_read</span>
            {reportMutation.isPending ? 'Generating...' : 'Auto-Generate Report'}
        </Button>
      </header>

      <Card className="flex flex-col bg-white border border-outline-variant/10 shadow-xl shadow-primary/5 rounded-[2.5rem] overflow-hidden h-[600px]">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className="flex items-end gap-3 max-w-[80%]">
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#1a1c1d] flex items-center justify-center text-primary shrink-0 shadow-md">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                )}
                
                <div className={`p-5 rounded-3xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-primary text-white rounded-br-sm shadow-md shadow-primary/20' 
                  : 'bg-slate-50 border border-outline-variant/10 text-on-surface rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                </div>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant opacity-30 mt-2 mx-12">
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex items-end gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-[#1a1c1d] flex items-center justify-center text-primary shrink-0 shadow-md">
                <span className="material-symbols-outlined text-sm">smart_toy</span>
              </div>
              <div className="p-5 rounded-3xl bg-slate-50 border border-outline-variant/10 rounded-bl-sm flex gap-2">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-50/50 border-t border-outline-variant/5">
          <form onSubmit={handleSubmit} className="relative flex items-center bg-white border border-outline-variant/10 rounded-[2rem] shadow-sm p-2 focus-within:border-primary/30 focus-within:shadow-md transition-all">
            <span className="material-symbols-outlined text-on-surface-variant opacity-30 ml-4 absolute pointer-events-none">auto_awesome</span>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about sales, performance, or operational metrics..."
              className="flex-1 h-12 pl-12 pr-4 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant/40 placeholder:font-medium"
              disabled={chatMutation.isPending}
            />
            <Button 
              type="submit" 
              disabled={!input.trim() || chatMutation.isPending}
              className="w-12 h-12 rounded-full p-0 flex items-center justify-center bg-[#1a1c1d] text-white hover:bg-primary transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-[#1a1c1d]"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </Button>
          </form>
          <div className="flex justify-center gap-4 mt-4">
              <button type="button" onClick={() => setInput("Show today's sales")} className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 hover:opacity-100 hover:text-primary transition-colors">"Show today's sales"</button>
              <button type="button" onClick={() => setInput("Which items are slow?")} className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 hover:opacity-100 hover:text-primary transition-colors">"Which items are slow?"</button>
          </div>
        </div>
      </Card>
    </div>
  );
}
