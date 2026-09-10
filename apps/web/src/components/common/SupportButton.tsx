import React, { useState } from 'react';
import { MessageSquare, X, Send, Heart, Sparkles } from 'lucide-react';

export const SupportButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'bot', text: 'Hello! I am Golden Hours AI Assistant. How can I help you with your emergency profile or tag today?' }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;

    const userText = msg;
    setChatLog(prev => [...prev, { sender: 'user', text: userText }]);
    setMsg('');

    setTimeout(() => {
      let reply = 'In an emergency, anyone can scan your physical Golden Hours QR tag to view your blood type and tap to dial your emergency contacts. No app is required.';
      if (userText.toLowerCase().includes('print') || userText.toLowerCase().includes('tag')) {
        reply = 'You can print standard wallet cards, helmet stickers, and wristbands directly from the QR Print studio at /dashboard/qr.';
      } else if (userText.toLowerCase().includes('doctor') || userText.toLowerCase().includes('allerg')) {
        reply = 'You can configure your severe drug allergies, doctor contacts, and medications in your profile at /dashboard/profile.';
      }
      setChatLog(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 700);
  };

  return (
    <>
      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[100] w-80 sm:w-96 bg-white rounded-3xl border border-[#D9DFD6] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          <div className="bg-[#11332D] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1C5C53] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#FF5A4E]" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-display">Golden Hours Support</h4>
                <span className="text-[10px] text-[#D9DFD6] font-mono">Online • AI Emergency Help</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 h-64 overflow-y-auto space-y-3 text-xs bg-[#F1F4EE]/40">
            {chatLog.map((c, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  c.sender === 'user'
                    ? 'ml-auto bg-[#FF5A4E] text-white rounded-tr-none'
                    : 'bg-white border border-[#D9DFD6] text-[#1A2421] rounded-tl-none shadow-sm'
                }`}
              >
                {c.text}
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#D9DFD6] flex gap-2">
            <input
              type="text"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#D9DFD6] focus:outline-none focus:border-[#1C5C53]"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-[#11332D] hover:bg-[#1C5C53] text-white transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#FF5A4E]" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-[99]">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#11332D] hover:bg-[#1C5C53] text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all focus:outline-none border border-white/20 animate-beacon cursor-pointer"
          aria-label="Ask Golden Hours Support"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </>
  );
};
