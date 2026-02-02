
import React, { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Film, Mic, Video, Send, UploadCloud, Trash2, StopCircle, Play, AlertCircle } from 'lucide-react';
import { PostType, User } from '../types';

interface CreatePostModalProps {
  currentUser: User;
  onClose: () => void;
  onSubmit: (content: string, type: PostType, mediaUrl?: string, audioDuration?: string) => void;
  t: any;
}

const MAX_CHARS = 500;

const CreatePostModal: React.FC<CreatePostModalProps> = ({ currentUser, onClose, onSubmit, t }) => {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedType, setSelectedType] = useState<PostType>(PostType.NOTE);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const recordingInterval = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear media when switching types
  useEffect(() => {
    setMediaUrl('');
    setAudioBlobUrl(null);
    setIsRecording(false);
    setRecordingTime(0);
    setError(null);
    if (recordingInterval.current) clearInterval(recordingInterval.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
       mediaRecorderRef.current.stop();
    }
  }, [selectedType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setMediaUrl(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
        stream.getTracks().forEach(track => track.stop()); // Stop mic usage
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      recordingInterval.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Microphone access denied");
    }
  };

  const stopRecording = () => {
     if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (recordingInterval.current) clearInterval(recordingInterval.current);
     }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (content.length > MAX_CHARS) {
        setError(`Text too long (${content.length}/${MAX_CHARS})`);
        return;
    }
    if (!content.trim() && !mediaUrl && !audioBlobUrl) return;
    
    let finalMediaUrl = mediaUrl;
    let duration = undefined;

    if (selectedType === PostType.AUDIO) {
       finalMediaUrl = audioBlobUrl || '';
       duration = formatTime(recordingTime);
    }

    onSubmit(content, selectedType, finalMediaUrl || undefined, duration);
    onClose();
  };

  const isMediaRequired = selectedType === PostType.CARD || selectedType === PostType.CLIP || selectedType === PostType.VIDEO;
  const isAudio = selectedType === PostType.AUDIO;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111119] border border-[#202030] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#202030]">
          <h2 className="text-[#F5F5FA] font-semibold">{t.create.title}</h2>
          <button onClick={onClose} className="text-[#A0A0C0] hover:text-[#F5F5FA] transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4">
          <div className="flex gap-3">
            <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-[#202030]" />
            <div className="flex-1 space-y-3">
               <textarea 
                className={`w-full bg-transparent placeholder-[#707090] resize-none outline-none text-lg min-h-[80px] ${error ? 'text-[#FF5B5B]' : 'text-[#F5F5FA]'}`}
                placeholder={t.create.placeholder}
                value={content}
                onChange={(e) => {
                    setContent(e.target.value);
                    if (e.target.value.length <= MAX_CHARS) setError(null);
                }}
                autoFocus={!isAudio}
              />
              
              {/* Media Upload Area */}
              {isMediaRequired && (
                <div className="space-y-2">
                  {!mediaUrl ? (
                    <div 
                      onClick={triggerFileInput}
                      className="border-2 border-dashed border-[#202030] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#5B8CFF] hover:bg-[#5B8CFF]/5 transition-all group"
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept={selectedType === PostType.CARD ? "image/png, image/jpeg" : "video/mp4"}
                        onChange={handleFileSelect}
                      />
                      <div className="bg-[#202030] p-3 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} className="text-[#5B8CFF]" />
                      </div>
                      <p className="text-[#F5F5FA] font-medium text-sm">
                        {selectedType === PostType.CARD ? 'Upload Image' : 'Upload Video'}
                      </p>
                      <p className="text-[#707090] text-xs mt-1">
                        {selectedType === PostType.CARD ? 'JPG, PNG' : 'MP4'}
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-[#202030] group">
                      {selectedType === PostType.CARD ? (
                        <img src={mediaUrl} alt="Preview" className="w-full h-48 object-cover" />
                      ) : (
                        <video src={mediaUrl} className="w-full h-48 object-cover" controls />
                      )}
                      <button 
                        onClick={() => setMediaUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-[#FF5B5B] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Audio Recorder Area */}
              {isAudio && (
                 <div className="bg-[#15151f] border border-[#202030] rounded-xl p-4 flex flex-col items-center justify-center gap-4">
                    <div className="text-[#F5F5FA] font-mono text-2xl font-bold tracking-wider">
                       {formatTime(recordingTime)}
                    </div>
                    
                    {/* Visualizer Mock */}
                    <div className="flex items-center gap-1 h-8">
                       {[...Array(20)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-1 rounded-full transition-all duration-100 ${isRecording ? 'bg-[#5B8CFF] animate-pulse' : 'bg-[#202030]'}`}
                            style={{ 
                              height: isRecording ? `${Math.random() * 100}%` : '20%',
                              animationDelay: `${i * 0.05}s` 
                            }}
                          />
                       ))}
                    </div>

                    <div className="flex items-center gap-4">
                       {!audioBlobUrl ? (
                         <button 
                           onClick={toggleRecording}
                           className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-[#202030] text-[#FF5B5B] border-2 border-[#FF5B5B]' : 'bg-[#FF5B5B] text-white hover:scale-110 shadow-lg shadow-[#FF5B5B]/30'}`}
                         >
                            {isRecording ? <StopCircle size={28} /> : <Mic size={28} />}
                         </button>
                       ) : (
                         <div className="flex items-center gap-3">
                            <button className="w-12 h-12 rounded-full bg-[#5B8CFF] text-white flex items-center justify-center">
                               <Play size={20} fill="currentColor" />
                            </button>
                            <button 
                              onClick={() => { setAudioBlobUrl(null); setRecordingTime(0); }}
                              className="text-[#707090] hover:text-[#FF5B5B] text-sm font-medium"
                            >
                              Retake
                            </button>
                         </div>
                       )}
                    </div>
                    <p className="text-xs text-[#707090]">
                       {isRecording ? 'Recording...' : audioBlobUrl ? 'Ready to share' : 'Tap to record'}
                    </p>
                 </div>
              )}

            </div>
          </div>
        </div>

        {/* Type Selector & Footer */}
        <div className="p-4 bg-[#0B0B10] border-t border-[#202030]">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
             {[
                { type: PostType.NOTE, label: t.create.types.note, icon: null },
                { type: PostType.CARD, label: t.create.types.card, icon: <ImageIcon size={16} /> },
                { type: PostType.CLIP, label: t.create.types.clip, icon: <Film size={16} /> },
                { type: PostType.VIDEO, label: t.create.types.video, icon: <Video size={16} /> },
                { type: PostType.AUDIO, label: t.create.types.voice, icon: <Mic size={16} /> },
             ].map((item) => (
                <button
                  key={item.type}
                  onClick={() => setSelectedType(item.type)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedType === item.type 
                    ? 'bg-[#202030] text-[#5B8CFF] border border-[#5B8CFF]/30' 
                    : 'text-[#707090] hover:bg-[#15151f] hover:text-[#A0A0C0]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
             ))}
          </div>

          <div className="flex items-center justify-between">
            <div className={`text-xs ${content.length > MAX_CHARS ? 'text-[#FF5B5B] font-bold' : 'text-[#5B8CFF]'}`}>
              {content.length > 0 && `${content.length}/${MAX_CHARS} ${t.create.chars}`}
              {error && <span className="ml-2 flex items-center gap-1"><AlertCircle size={10}/> {error}</span>}
            </div>
            <button 
              onClick={handleSubmit}
              disabled={(!content.trim() && !mediaUrl && !audioBlobUrl) || content.length > MAX_CHARS}
              className="bg-gradient-to-r from-[#5B8CFF] to-[#7B5BFF] text-white px-5 py-2 rounded-full font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              <span>{t.create.publish}</span>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
