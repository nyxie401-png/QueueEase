import { useEffect, useMemo, useRef, useState } from 'react';
import { apiPost } from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MessageSquare, Send, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const ChatbotScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      text: 'Hello! I am your QueueEase AI assistant. Ask me anything about appointments, clinics, notifications, or how to use the app.',
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const messageHistory = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.text,
      })),
    [messages],
  );

  const handleSend = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmedPrompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setError('');
    setIsLoading(true);

    try {
      const response = await apiPost<{ reply: string }>('/chatbot', {
        message: trimmedPrompt,
        history: messageHistory,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.data.reply || 'I could not generate a response. Please try again.',
        },
      ]);
    } catch (exception) {
      setError('Unable to send your message right now. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-4 pt-6 pb-8 md:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">AI Assistant</h1>
          <p className="text-sm text-slate-600">Ask questions about QueueEase, bookings, and app navigation.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 rounded-3xl px-4 py-3 ${
                message.role === 'assistant' ? 'bg-slate-50' : 'bg-primary/5 self-end'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                {message.role === 'assistant' ? <MessageSquare className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>
              <div className="space-y-1 text-sm leading-6 text-slate-800">
                <p className="font-medium text-slate-900">{message.role === 'assistant' ? 'Assistant' : 'You'}</p>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto]">
        <Input
          placeholder="Type your message..."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={isLoading} className="h-12 w-full sm:w-auto">
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Sending...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> Send
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ChatbotScreen;
