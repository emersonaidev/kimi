import { ArrowLeft, Send } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getChatInputBg } from '../utils/theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatAssistantProps {
  onNavigate: (screen: 'dashboard' | 'settings' | 'chat' | 'health') => void;
  onBack: () => void;
}

export function ChatAssistant({ onNavigate, onBack }: ChatAssistantProps) {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm KIMI, your AI assistant. I'm here to help you understand Ester's daily patterns, activities, and well-being.\n\nI can provide insights about:\n• Movement and location history\n• Heart rate and stress patterns\n• Sleep quality and routines\n• Activity levels throughout the day\n\nHow can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Stress related
    if (lowerMsg.includes('stress') || lowerMsg.includes('anxiety')) {
      return "Ester's current stress level is 42 (moderate). Today she experienced a significant spike at 4:00 PM reaching 85, which is concerning. This could be related to environmental factors or a challenging situation. I recommend checking her location history during that time and considering whether any routine changes might help.";
    }
    
    // Location related
    if (lowerMsg.includes('location') || lowerMsg.includes('where') || lowerMsg.includes('place')) {
      return "Ester is currently at home in Porto, Portugal. She's been at this location for the past 2 hours. Her movement patterns today show she visited the park this morning (9:30-11:00 AM) and stopped by the local café around noon. Would you like to see her full route history?";
    }
    
    // Heart rate related
    if (lowerMsg.includes('heart') || lowerMsg.includes('bpm') || lowerMsg.includes('pulse')) {
      return "Ester's current heart rate is 72 BPM, which is within the normal range. Her average resting heart rate over the past week has been 68 BPM. I noticed a slightly elevated rate during the stress spike at 4 PM today (95 BPM), but it returned to normal within 30 minutes.";
    }
    
    // Sleep related
    if (lowerMsg.includes('sleep') || lowerMsg.includes('rest') || lowerMsg.includes('night')) {
      return "Ester slept 7.2 hours last night (11:15 PM - 6:30 AM). Her sleep quality was good with minimal interruptions. She's been maintaining a consistent sleep schedule this week, averaging 7.5 hours per night, which is excellent for her wellbeing.";
    }
    
    // Activity related
    if (lowerMsg.includes('activity') || lowerMsg.includes('active') || lowerMsg.includes('exercise')) {
      return "Ester has been moderately active today with 6,432 steps so far. Her morning walk to the park was her most active period. She tends to be most active between 9 AM and 12 PM. Her weekly activity average is 8,200 steps per day, which shows good consistency.";
    }
    
    // Wellness/Health related
    if (lowerMsg.includes('wellness') || lowerMsg.includes('health') || lowerMsg.includes('feeling')) {
      return "Ester's overall wellness score today is 73/100 (Good). Her vital signs are stable, activity levels are appropriate, and sleep quality is consistent. The main area of attention is the stress spike this afternoon. Otherwise, her daily patterns are healthy and predictable.";
    }
    
    // Temperature related
    if (lowerMsg.includes('temperature') || lowerMsg.includes('temp') || lowerMsg.includes('hot') || lowerMsg.includes('cold')) {
      return "Ester's body temperature is currently 36.8°C, which is perfectly normal. The KIMI wearable monitors temperature continuously to detect any unusual changes that might indicate discomfort or health issues.";
    }
    
    // Pattern/Routine related
    if (lowerMsg.includes('pattern') || lowerMsg.includes('routine') || lowerMsg.includes('schedule')) {
      return "Ester follows a consistent daily routine. She typically wakes around 7 AM, has her most active period 9-12 AM, lunch around 1 PM, and a quieter afternoon. Evenings are calm with lower stress levels. This predictability is beneficial for her wellbeing. Any significant deviations from this pattern trigger notifications.";
    }
    
    // Default responses
    const defaultResponses = [
      "I can help you understand Ester's health metrics, location history, daily patterns, and stress levels. What specific information would you like to know?",
      "Based on Ester's data today, everything looks normal except for the stress spike at 4 PM. Would you like me to analyze what might have caused it?",
      "I'm monitoring Ester's vitals, location, and activity continuously. Is there something specific you'd like me to check or explain?",
      "Ester's overall health trends are positive. Her stress management has improved 15% over the past month. What aspect of her wellbeing interests you most?",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    
    // Simulate AI typing
    setIsTyping(true);
    
    // AI response after delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getAIResponse(message),
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay 1-2 seconds
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Glassmorphism */}
      <header 
        className="border-b flex items-center gap-4 px-4 py-3 pt-[max(1.3125rem,env(safe-area-inset-top))]"
        style={{
          backgroundColor: getChatInputBg(theme),
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--border)',
        }}
      >
        <button 
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-secondary active:scale-95 rounded-[var(--radius)] transition-all"
          aria-label="Go back to dashboard"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <h2>KIMI Assistant</h2>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 bg-background pb-32" ref={mainRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 mb-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            {msg.sender === 'ai' && (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--chart-2) 100%)',
                }}
              >
                <span className="text-primary-foreground caption">KIMI</span>
              </div>
            )}
            
            <div 
              className={`flex-1 rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)] ${
                msg.sender === 'user' 
                  ? 'max-w-[80%]' 
                  : 'bg-card'
              }`}
              style={{
                whiteSpace: 'pre-line',
                ...(msg.sender === 'user' && {
                  backgroundColor: 'var(--chart-2)',
                  color: 'white',
                })
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--chart-2) 100%)',
              }}
            >
              <span className="text-primary-foreground caption">KIMI</span>
            </div>
            
            <div className="flex-1 bg-card rounded-[var(--radius-card)] p-4 shadow-[var(--shadow-elevation-sm)]">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <div 
        className="fixed bottom-[20px] left-0 right-0 border-t px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        style={{
          backgroundColor: getChatInputBg(theme),
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-secondary px-4 py-2 rounded-[var(--radius-button)] outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="w-12 h-12 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform shadow-sm"
            style={{
              backgroundColor: 'var(--chart-2)',
            }}
            aria-label="Send message"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}