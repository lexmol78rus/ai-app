/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, RotateCcw, User, Bot, Apple, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithNutritionist } from './lib/gemini';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Здравствуйте! Я ваш ИИ-диетолог. Введите список продуктов, которые вы съели или планируете съесть, и я рассчитаю их калорийность и соответствие вашим целям.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(1850);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState('1850');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = messages.concat(userMessage).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const aiResponse = await chatWithNutritionist(history, calorieGoal);
    
    // Clean up any residual markdown/asterisks just in case
    const cleanResponse = aiResponse.replace(/[*#_~`>]/g, '').trim();
    
    setMessages(prev => [...prev, { role: 'model', text: cleanResponse }]);
    setIsLoading(false);
  };

  const handleRestart = () => {
    setMessages([
      { role: 'model', text: 'Чат сброшен. Здравствуйте! Я ваш ИИ-диетолог. Чем могу помочь сегодня?' }
    ]);
    setInput('');
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const saveGoal = () => {
    const val = parseInt(tempGoal);
    if (!isNaN(val) && val > 0) {
      setCalorieGoal(val);
      setIsEditingGoal(false);
      setMessages(prev => [...prev, { role: 'model', text: `Цель обновлена: ${val} ккал. Теперь я буду ориентироваться на этот показатель.` }]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white font-sans overflow-hidden text-text-main">
      {/* Header */}
      <header className="h-16 border-b border-border flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-3 font-semibold text-xl text-accent">
          <Apple size={24} />
          <span>NutriGemini</span>
        </div>
        <div className="bg-[#e8f0fe] text-[#1967d2] px-3 py-1 rounded-full text-xs font-medium">
          Gemini Pro 1.5
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-sidebar-bg border-r border-border p-6 flex flex-col gap-5 shrink-0 hidden md:flex">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[12px] uppercase tracking-wider text-text-secondary font-bold">Текущая цель</p>
              {!isEditingGoal ? (
                <button 
                  onClick={() => { setIsEditingGoal(true); setTempGoal(calorieGoal.toString()); }}
                  className="text-text-secondary hover:text-accent transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={saveGoal} className="text-accent hover:text-accent-hover"><Check size={14} /></button>
                  <button onClick={() => setIsEditingGoal(false)} className="text-red-500 hover:text-red-600"><X size={14} /></button>
                </div>
              )}
            </div>
            <div className="bg-white border border-border rounded-lg p-4 mt-2 shadow-sm">
              {isEditingGoal ? (
                <div className="flex flex-col gap-2">
                  <input 
                    type="number" 
                    value={tempGoal}
                    onChange={(e) => setTempGoal(e.target.value)}
                    className="w-full border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                  />
                  <p className="text-[10px] text-text-secondary italic">Введите целевое кол-во ккал</p>
                </div>
              ) : (
                <>
                  <p className="text-[12px] text-text-secondary">Снижение веса</p>
                  <p className="text-2xl font-semibold text-accent mt-1">{calorieGoal.toLocaleString()} ккал</p>
                  <p className="text-[11px] text-text-secondary mt-1 italic">Нажмите на иконку карандаша для изменения</p>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-[12px] uppercase tracking-wider text-text-secondary font-bold">Рекомендации</p>
            <ul className="mt-3 space-y-2 text-[13px] text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Больше белка на ужин</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Минимум 2л воды</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent">•</span>
                <span>Омега-3 в 14:00</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Chat Container */}
        <section className="flex-1 flex flex-col bg-white relative overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[80%] p-3 px-4 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-user-bubble self-end rounded-br-none' 
                      : 'bg-bot-bubble self-start rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bot-bubble self-start p-3 px-4 rounded-xl rounded-bl-none"
              >
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <footer className="border-t border-border p-5 px-6 flex flex-col gap-3 shrink-0">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Напишите список продуктов, и я предложу рецепты под вашу цель..."
                className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`px-5 h-11 rounded-lg font-semibold text-sm transition-colors ${
                  input.trim() && !isLoading 
                    ? 'bg-accent text-white hover:bg-accent-hover' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Отправить сообщение
              </button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-[12px] text-text-secondary">Нажмите Enter, чтобы отправить</p>
              <button
                onClick={handleRestart}
                className="px-4 h-9 border border-border rounded-lg text-text-secondary text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={14} />
                Стартовать чат заново
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}
