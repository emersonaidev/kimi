import { Activity, Clock, MapPin, Heart } from 'lucide-react';

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

const suggestions = [
  { icon: MapPin, text: "Where has Ester been today?", color: "var(--chart-1)" },
  { icon: Heart, text: "How's Ester's heart rate?", color: "var(--chart-2)" },
  { icon: Clock, text: "Show sleep patterns", color: "var(--chart-3)" },
  { icon: Activity, text: "Activity summary", color: "var(--chart-4)" },
];

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => {
        const Icon = suggestion.icon;
        return (
          <button
            key={index}
            onClick={() => onSelect(suggestion.text)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-card rounded-[var(--radius-button)] border border-border hover:border-primary/50 active:scale-95 transition-all shadow-sm hover:shadow-md"
            style={{
              animation: `slideUp 0.3s ease-out ${index * 0.1}s both`,
            }}
          >
            <Icon 
              className="w-4 h-4 transition-colors" 
              style={{ color: suggestion.color }}
            />
            <span className="caption group-hover:text-foreground transition-colors">
              {suggestion.text}
            </span>
          </button>
        );
      })}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}