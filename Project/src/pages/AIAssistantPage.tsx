import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import AIOrb3D from '../components/3d/AIOrb3D';
import CanvasContainer, { CanvasErrorBoundary } from '../components/3d/CanvasContainer';
import { api } from '../utils/api';
import { ChatMessage, CampusSummary, Building } from '../types';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  TrendingDown,
  Building2,
  ShieldCheck,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [campusData, setCampusData] = useState<{
    latest: CampusSummary;
    buildings: Building[];
  } | null>(null);

  const sessionId = useRef(`session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load initial suggestions and campus reference context
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [sugList, campRes] = await Promise.all([
          api.getSuggestions().catch(() => [
            'What is the total carbon footprint of our campus this month?',
            'Which building has the highest energy consumption?',
            'How can we reduce emissions in the Science Building?',
            'Compare the sustainability scores of all buildings',
            'What would happen if we reduced electricity by 20%?',
          ]),
          api.getCampusSummary().catch(() => null),
        ]);

        if (isMounted) {
          setSuggestions(sugList);
          if (campRes) setCampusData(campRes);

          // Initial greeting message
          setMessages([
            {
              id: 'init-msg',
              role: 'assistant',
              content: `Hello! I am your **GreenCampus AI Assistant**.\n\nI am synchronized with our 3D digital twin and auditable campus database. I can calculate exact carbon emissions, benchmark facility performance, or evaluate What-If decarbonization scenarios.\n\nWhat would you like to explore today?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } catch (err) {
        console.warn('AI assistant initialization notice', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const response = await api.chat(textToSend, sessionId.current);

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.response || 'Telemetry analyzed. Carbon footprint updated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: response.intent,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Encountered an issue connecting to the AI router: ${err.message || 'Please check backend server'}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Simple Markdown renderer for chat responses
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-emerald-300 mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        const itemText = line.replace('- ', '');
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc my-0.5">
            <span
              dangerouslySetInnerHTML={{
                __html: itemText
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                  .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-emerald-300 text-[11px]">$1</code>'),
              }}
            />
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p
          key={idx}
          className="text-xs text-slate-300 leading-relaxed my-1"
          dangerouslySetInnerHTML={{
            __html: line
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
              .replace(/`(.*?)`/g, '<code class="bg-slate-800 px-1 py-0.5 rounded text-emerald-300 text-[11px]">$1</code>'),
          }}
        />
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-5.5rem)] flex flex-col overflow-hidden">
      {/* ── TOP HEADER WITH 3D ORB ────────────────────────────────────── */}
      <div className="glass-card p-4 sm:p-5 flex items-center justify-between gap-4 mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Animated 3D Mini Neural Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-500/30 relative flex-shrink-0 bg-slate-950">
            <CanvasContainer camera={{ position: [0, 0, 4.2], fov: 45 }}>
              <AIOrb3D isProcessing={isLoading} scale={0.65} interactive={false} />
            </CanvasContainer>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">AI Sustainability Assistant</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Gemini 1.5 Grounded
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Deterministic EPA carbon factors + institutional telemetry reasoning
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'init-msg',
                role: 'assistant',
                content: `Chat session refreshed. How can I assist with campus decarbonization?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
            sessionId.current = `session_${Date.now()}`;
          }}
          className="p-2 rounded-lg bg-slate-900 border border-emerald-500/20 text-slate-400 hover:text-emerald-300 transition-colors"
          title="Reset Conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ── CHAT & REFERENCE SPLIT ───────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden">
        {/* LEFT / CENTER: CHAT INTERFACE (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col glass-card overflow-hidden">
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-emerald-500/20 rounded-tl-none shadow-lg'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    renderFormattedContent(msg.content)
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                  <span
                    className={`block text-[9px] font-mono mt-2 text-right ${
                      msg.role === 'user' ? 'text-emerald-200' : 'text-slate-500'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Bot className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="bg-slate-900/90 border border-emerald-500/20 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono text-emerald-400">
                    Querying campus telemetry & calculating carbon models...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts Pill Carousel */}
          {suggestions.length > 0 && (
            <div className="p-3 border-t border-emerald-500/10 bg-slate-950/60 overflow-x-auto flex gap-2">
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1 flex-shrink-0">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Suggested:
              </span>
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(sug)}
                  className="flex-shrink-0 text-[11px] font-mono px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/20 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <div className="p-3 bg-slate-950/90 border-t border-emerald-500/20 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about emissions, building energy, or carbon reduction scenarios..."
              className="flex-1 bg-slate-900 border border-emerald-500/30 text-white placeholder-slate-500 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT: LIVE TELEMETRY REFERENCES & 3D NEURAL ORB (4 Cols) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 overflow-y-auto">
          {/* 3D Neural Intelligence Core */}
          <div className="glass-card p-4 relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between border-b border-emerald-500/10 pb-2 mb-2">
              <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                Neural Intelligence Core
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isLoading ? 'bg-emerald-500/20 text-emerald-300 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                {isLoading ? 'Synthesizing...' : 'Live Model Bus'}
              </span>
            </div>

            <div className="w-full h-52 relative rounded-xl overflow-hidden bg-slate-950/60 border border-emerald-500/10">
              <CanvasContainer
                camera={{ position: [0, 0, 4.4], fov: 45 }}
                fallbackText="Loading Neural Model..."
              >
                <AIOrb3D isProcessing={isLoading} intensity={1.1} />
              </CanvasContainer>
            </div>

            <div className="w-full mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>Synaptic Connections: 28 Nodes</span>
              <span className="text-emerald-400">Gemini 1.5 Grounded</span>
            </div>
          </div>

          {/* Reference Card 1: Live Campus Snapshot */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
              <span className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Campus Grounding
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {campusData?.latest?.month ?? '2024-12'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Gross Monthly Footprint:</span>
                <span className="text-white font-bold">
                  {campusData?.latest?.total_emissions_kg_co2?.toLocaleString() ?? '32,640'} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Electricity:</span>
                <span className="text-emerald-400">
                  {campusData?.latest?.total_electricity_kwh?.toLocaleString() ?? '68,420'} kWh
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Clean Renewable Share:</span>
                <span className="text-emerald-400">
                  {campusData?.latest?.renewable_percentage ?? 28.4}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campus Eco-Score:</span>
                <span className="text-emerald-400 font-bold">
                  {campusData?.latest?.campus_sustainability_score ?? 74.2}/100
                </span>
              </div>
            </div>
          </div>

          {/* Reference Card 2: Top Load Drivers */}
          <div className="glass-card p-4 space-y-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              Highest Load Facilities
            </span>

            <div className="space-y-2">
              {(campusData?.buildings || []).slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
                >
                  <div>
                    <span className="text-slate-200 block font-semibold">{b.name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{b.type}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {b.latest_electricity?.toLocaleString()} kWh
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Reference Card 3: EPA Calculation Rules */}
          <div className="glass-card p-4 text-[11px] font-mono text-slate-400 space-y-1.5">
            <span className="text-xs text-slate-300 font-bold block mb-1">
              Deterministic Emission Factors
            </span>
            <p>• Electricity: 0.417 kg CO₂/kWh (eGRID)</p>
            <p>• Natural Gas: 5.3 kg CO₂/therm</p>
            <p>• Municipal Waste: 587 kg CO₂/ton</p>
            <p>• Recycling: -183 kg CO₂/ton (offset)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
