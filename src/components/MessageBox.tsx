import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, Volume2 } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content?: string;
  audio_path?: string;
  message_type: 'text' | 'audio';
  created_at: string;
  senderName: string;
  isOwn: boolean;
}

interface MessageBoxProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onSendAudio: (audioBlob: Blob) => Promise<void>;
  loading?: boolean;
}

export default function MessageBox({
  messages,
  onSendMessage,
  onSendAudio,
  loading = false,
}: MessageBoxProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async () => {
    if (inputValue.trim()) {
      await onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await onSendAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      const interval = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 300) {
            // Max 5 min
            mediaRecorder.stop();
            clearInterval(interval);
            return t;
          }
          return t + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucun message. Commencez la conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.isOwn
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-xs font-semibold mb-1">{msg.senderName}</p>
                {msg.message_type === 'text' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setPlayingAudioId(
                          playingAudioId === msg.id ? null : msg.id
                        )
                      }
                      className="flex items-center gap-1 text-xs"
                    >
                      <Volume2 className="w-4 h-4" />
                      Audio
                    </button>
                    {playingAudioId === msg.id && msg.audio_path && (
                      <audio autoPlay src={msg.audio_path} />
                    )}
                  </div>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR')}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 space-y-3">
        {isRecording ? (
          <div className="bg-red-50 p-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-red-700">
                Enregistrement... {formatTime(recordingTime)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendText();
                }
              }}
              placeholder="Votre message..."
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            />
            <button
              onClick={handleSendText}
              disabled={!inputValue.trim() || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
            <button
              onClick={startRecording}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Audio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
