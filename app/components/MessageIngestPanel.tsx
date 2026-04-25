'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

export type EmergencyType = 'Flood' | 'Medical' | 'Fire' | 'Food' | 'Other';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface IngestedMessage {
  id: string;
  rawText: string;
  type: EmergencyType;
  title: string;
  location: string;
  severity: SeverityLevel;
  priority: SeverityLevel;
  requester: string;
  description: string;
  timestamp: Date;
}

const emergencyTypeKeywords: Record<EmergencyType, string[]> = {
  Flood: ['flood', 'water', 'river', 'rain', 'submerged', 'wave', 'rising'],
  Medical: ['medical', 'injured', 'ambulance', 'doctor', 'hospital', 'blood', 'emergency'],
  Fire: ['fire', 'burning', 'smoke', 'flames', 'burn', 'blast'],
  Food: ['food', 'water', 'hunger', 'eat', 'hungry', 'meal', 'water bottles'],
  Other: [],
};

const severityKeywords: Record<SeverityLevel, string[]> = {
  critical: ['critical', 'urgent', 'immediately', 'help', 'trapped', 'life', 'please help', 'need help'],
  high: ['need', 'required', 'soon', 'now', 'asap', 'important'],
  medium: ['request', 'need', 'priority', 'as soon as possible'],
  low: ['safe', 'okay', 'stable', 'weather', 'shelter'],
};

const knownLocations = [
  'downtown',
  'east district',
  'central park',
  'river side',
  'north shelter',
  'hospital district',
  'riverside zone',
  'relief camp',
  'shelter',
  'camp',
];

const normalizeLocation = (text: string) => {
  const locationRegex = /(?:in|at|near|on|from)\s+([A-Za-z0-9 ]+?)(?=[\.,;!]|$)/i;
  const match = text.match(locationRegex);

  if (match && match[1]) {
    return match[1].trim();
  }

  const lower = text.toLowerCase();
  const found = knownLocations.find((place) => lower.includes(place));
  return found ? found : 'Unknown area';
};

const getEmergencyType = (text: string): EmergencyType => {
  const lower = text.toLowerCase();

  for (const type of Object.keys(emergencyTypeKeywords) as EmergencyType[]) {
    if (emergencyTypeKeywords[type].some((keyword) => lower.includes(keyword))) {
      return type;
    }
  }

  return 'Other';
};

const getSeverity = (text: string): SeverityLevel => {
  const lower = text.toLowerCase();

  if (severityKeywords.critical.some((keyword) => lower.includes(keyword))) {
    return 'critical';
  }

  if (severityKeywords.high.some((keyword) => lower.includes(keyword))) {
    return 'high';
  }

  if (severityKeywords.medium.some((keyword) => lower.includes(keyword))) {
    return 'medium';
  }

  return 'low';
};

const createIngestedMessage = (text: string): IngestedMessage => {
  const type = getEmergencyType(text);
  const location = normalizeLocation(text);
  const severity = getSeverity(text);
  const title = `${type !== 'Other' ? type : 'Emergency'} alert${location !== 'Unknown area' ? ` in ${location}` : ''}`;

  return {
    id: Date.now().toString(),
    rawText: text,
    type,
    title,
    location,
    severity,
    priority: severity,
    requester: 'Social media feed',
    description: text,
    timestamp: new Date(),
  };
};

interface MessageIngestPanelProps {
  onSubmit?: (message: IngestedMessage) => void;
}

export const MessageIngestPanel: React.FC<MessageIngestPanelProps> = ({ onSubmit = () => {} }) => {
  const [message, setMessage] = useState('');
  const [recent, setRecent] = useState<IngestedMessage[]>([]);

  const handleSubmit = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const newMessage = createIngestedMessage(trimmed);
    onSubmit(newMessage);
    setRecent((prev) => [newMessage, ...prev].slice(0, 5));
    setMessage('');
  }, [message, onSubmit]);

  const examples = useMemo(
    () => [
      'We are stuck in downtown, please help, flood water is rising fast.',
      'Need food and water urgently at East District relief camp.',
      'Medical emergency here at the hospital district, many injured.',
      'Fire outbreak near Central Park, flames spreading quickly.',
    ],
    [],
  );

  return (
    <div className="neon-card space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={20} className="text-cyan-300" />
        <h2 className="text-lg font-bold text-cyan-400">Social Media Ingest</h2>
      </div>

      <p className="text-sm text-gray-400">
        Paste a raw alert post and watch the system extract incident type, location, and severity.
      </p>

      <textarea
        rows={5}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="e.g. Need medical help at North Shelter, multiple injuries"
        className="neon-input resize-none"
      />

      <button
        onClick={handleSubmit}
        className="neon-button-primary inline-flex items-center gap-2 mt-2"
      >
        <Send size={16} /> Ingest Message
      </button>

      <div className="space-y-3 pt-4 border-t" style={{ borderTopColor: 'rgba(0, 255, 255, 0.16)' }}>
        <h3 className="text-sm font-semibold text-cyan-300">Example posts</h3>
        <div className="grid gap-2 text-xs text-slate-300">
          {examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setMessage(example)}
              className="text-left rounded-lg border border-cyan-500/20 px-3 py-2 text-xs hover:bg-cyan-500/10"
            >
              {example} 
            </button>
          ))}
        </div>
      </div>

      {recent.length > 0 ? (
        <div className="space-y-2 pt-4 border-t" style={{ borderTopColor: 'rgba(0, 255, 255, 0.16)' }}>
          <h3 className="text-sm font-semibold text-cyan-300">Recent ingested posts</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {recent.map((item) => (
              <div key={item.id} className="rounded-lg border px-3 py-2 bg-slate-950/40 border-cyan-500/15 text-xs text-slate-200">
                <div className="font-semibold text-cyan-200">{item.type} • {item.severity.toUpperCase()}</div>
                <div className="truncate">{item.rawText}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default React.memo(MessageIngestPanel);
