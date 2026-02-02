
import React, { useEffect, useRef, useState } from 'react';
import { Chat, User, MessageType, ChatCategory } from '../types';
import { Send, Phone, Video, Info, ArrowLeft, Mic, StopCircle, Play, PhoneOff, VideoOff, MicOff, MessageSquare, Megaphone, User as UserIcon } from 'lucide-react';

interface ChatInterfaceProps {
  chats: Chat[];
  currentUser: User;
  onSendMessage: (chatId: string, text: string, type: MessageType, audioDuration?: string) => void;
  selectedChatId: string | null;
  onSelectChat: (id: string | null) => void;
  t: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  chats, 
  currentUser, 
  onSendMessage, 
  selectedChatId, 
  onSelectChat,
  t 
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState<'AUDIO' | 'VIDEO'>('AUDIO');
  const [activeTab, setActiveTab] = useState<'ALL' | ChatCategory>('ALL');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingInterval = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activeChat = chats.find(c => c.id === selectedChatId);

  // Filter chats based on tab
  const filteredChats = activeTab === 'ALL' 
    ? chats 
    : chats.filter(c => c.category === activeTab);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  // Recording Timer
  useEffect(() => {
    if (isRecording) {
      recordingInterval.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      setRecordingTime(0);
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

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

        mediaRecorderRef.current.start();
        setIsRecording(true);
     } catch (err) {
        console.error("Microphone access denied", err);
     }
  };

  const stopRecordingAndSend = () => {
     if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
           const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
           const url = URL.createObjectURL(audioBlob); // Only valid for this session
           
           if (!selectedChatId) return;
           
           const mins = Math.floor(recordingTime / 60);
           const secs = recordingTime % 60;
           const duration = `${mins}:${secs.toString().padStart(2, '0')}`;
           
           // Hack: In real app, we'd upload blob. Here we pass the text as the URL
           // but our onSendMessage expects text. We'll overload 'text' to hold the URL for AUDIO type.
           onSendMessage(selectedChatId, url, MessageType.AUDIO, duration);
           
           // Stop all tracks
           mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorderRef.current.stop();
        setIsRecording(false);
     }
  };

  const handleSend = () => {
    if (!inputText.trim() || !selectedChatId) return;
    onSendMessage(selectedChatId, inputText, MessageType.TEXT);
    setInputText('');
  };

  const startCall = (type: 'AUDIO' | 'VIDEO') => {
    setCallType(type);
    setIsCalling(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const renderTab = (key: 'ALL' | ChatCategory, label: string, Icon: any) => (
    <button
      onClick={() => setActiveTab(key)}
      className={`flex-1 flex flex-col items-center justify-center py-3 border-b-2 transition-colors ${
        activeTab === key 
          ? 'border-[#5B8CFF] text-[#F5F5FA]' 
          : 'border-transparent text-[#707090] hover:text-[#A0A0C0]'
      }`}
    >
      <Icon size={18} className="mb-1" />
      <span className="text-[10px] font-medium uppercase">{label}</span>
    </button>
  );

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen flex bg-[#0B0B10] relative">
      
      {/* Call Overlay */}
      {isCalling && activeChat && (
        <div className="absolute inset-0 z-50 bg-[#0B0B10]/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
           <div className="w-32 h-32 rounded-full border-4 border-[#202030] overflow-hidden mb-6 shadow-[0_0_50px_rgba(91,140,255,0.2)] animate-pulse">
             <img src={activeChat.participant.avatar} alt="" className="w-full h-full object-cover" />
           </div>
           <h2 className="text-2xl font-bold text-[#F5F5FA] mb-2">{activeChat.participant.name}</h2>
           <p className="text-[#5B8CFF] mb-12 animate-pulse">{t.chat.calling}</p>
           
           <div className="flex gap-6">
             <button className="p-4 rounded-full bg-[#202030] hover:bg-[#303040] text-[#F5F5FA] transition-colors">
               <MicOff size={24} />
             </button>
             {callType === 'VIDEO' && (
               <button className="p-4 rounded-full bg-[#202030] hover:bg-[#303040] text-[#F5F5FA] transition-colors">
                 <VideoOff size={24} />
               </button>
             )}
             <button 
               onClick={() => setIsCalling(false)}
               className="p-4 rounded-full bg-[#FF5B5B] hover:bg-[#ff4040] text-white transition-colors transform hover:scale-110"
             >
               <PhoneOff size={28} />
             </button>
           </div>
        </div>
      )}

      {/* Chat List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-[#202030] flex flex-col ${selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-[#202030]">
          <h2 className="text-xl font-bold text-[#F5F5FA]">{t.chat.title}</h2>
        </div>

        {/* Focus Tabs */}
        <div className="flex bg-[#111119] border-b border-[#202030]">
          {renderTab('ALL', t.chat.tabs.all, MessageSquare)}
          {renderTab(ChatCategory.PERSONAL, t.chat.tabs.personal, UserIcon)}
          {renderTab(ChatCategory.DISCUSSION, t.chat.tabs.discussion, Info)}
          {renderTab(ChatCategory.CHANNEL, t.chat.tabs.channel, Megaphone)}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? filteredChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`p-4 flex items-center gap-3 cursor-pointer transition-colors ${selectedChatId === chat.id ? 'bg-[#15151f] border-r-2 border-[#5B8CFF]' : 'hover:bg-[#111119]'}`}
            >
              <div className="relative">
                <img src={chat.participant.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                {chat.category === ChatCategory.DISCUSSION && (
                  <div className="absolute -bottom-1 -right-1 bg-[#202030] rounded-full p-0.5">
                     <div className="w-4 h-4 bg-[#707090] rounded-full flex items-center justify-center text-[8px] text-white">#</div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-[#F5F5FA] font-medium truncate">{chat.participant.name}</h3>
                  <span className="text-[#707090] text-xs">{chat.lastMessageTime}</span>
                </div>
                <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-[#F5F5FA] font-medium' : 'text-[#707090]'}`}>
                  {chat.messages.length > 0 && chat.messages[chat.messages.length - 1].type === MessageType.AUDIO 
                    ? `🎤 ${t.chat.voiceMessage}` 
                    : chat.lastMessage}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="w-5 h-5 rounded-full bg-[#5B8CFF] text-white text-xs flex items-center justify-center">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          )) : (
            <div className="p-8 text-center text-[#707090] text-sm">
               No chats in this category.
            </div>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col bg-[#0B0B10] ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {/* Header */}
            <div className="h-16 border-b border-[#202030] flex items-center justify-between px-4 bg-[#111119]/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onSelectChat(null)}
                  className="md:hidden text-[#A0A0C0] hover:text-[#F5F5FA]"
                >
                  <ArrowLeft size={24} />
                </button>
                <img src={activeChat.participant.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h3 className="text-[#F5F5FA] font-medium flex items-center gap-2">
                    {activeChat.participant.name}
                    {activeChat.category === ChatCategory.CHANNEL && <Megaphone size={14} className="text-[#5B8CFF]" />}
                  </h3>
                  <span className="text-[#707090] text-xs">{t.chat.online}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#5B8CFF]">
                <button onClick={() => startCall('AUDIO')} className="hover:bg-[#202030] p-2 rounded-full transition-colors"><Phone size={20} /></button>
                <button onClick={() => startCall('VIDEO')} className="hover:bg-[#202030] p-2 rounded-full transition-colors"><Video size={20} /></button>
                <button className="hover:bg-[#202030] p-2 rounded-full transition-colors text-[#A0A0C0]"><Info size={20} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isMe 
                        ? 'bg-gradient-to-r from-[#5B8CFF] to-[#7B5BFF] text-white rounded-br-none' 
                        : 'bg-[#202030] text-[#F5F5FA] rounded-bl-none'
                    }`}>
                      {msg.type === MessageType.AUDIO ? (
                        <div className="flex items-center gap-3 min-w-[120px]">
                           <audio src={msg.text} controls className="w-full h-8" />
                           <span className="text-xs opacity-70 whitespace-nowrap">{msg.audioDuration}</span>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.text}</p>
                      )}
                      
                      <span className={`text-[10px] block text-right mt-1 ${isMe ? 'text-white/70' : 'text-[#A0A0C0]'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#202030] bg-[#111119]">
              {activeChat.category === ChatCategory.CHANNEL ? (
                 <div className="text-center text-[#707090] text-sm italic">
                    Only admins can post in this channel.
                 </div>
              ) : (
                <div className="flex items-center gap-2 bg-[#0B0B10] border border-[#202030] rounded-full px-4 py-2 focus-within:border-[#5B8CFF] transition-colors relative">
                  
                  {isRecording ? (
                     <div className="flex-1 flex items-center gap-2 text-[#FF5B5B] animate-pulse font-medium">
                        <div className="w-3 h-3 bg-[#FF5B5B] rounded-full"></div>
                        <span>Recording... {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}</span>
                     </div>
                  ) : (
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t.chat.placeholder}
                      className="flex-1 bg-transparent text-[#F5F5FA] placeholder-[#707090] outline-none text-sm"
                    />
                  )}
                  
                  {inputText.trim() ? (
                     <button 
                      onClick={handleSend}
                      className="p-2 text-[#5B8CFF] transition-colors"
                    >
                      <Send size={20} />
                    </button>
                  ) : (
                     <button 
                      onMouseDown={startRecording}
                      onMouseUp={stopRecordingAndSend}
                      onMouseLeave={() => { if(isRecording) stopRecordingAndSend(); }} // Simplify handling
                      className={`p-2 transition-all ${isRecording ? 'text-[#FF5B5B] scale-125' : 'text-[#707090] hover:text-[#F5F5FA]'}`}
                      title={t.chat.holdToRecord}
                     >
                       {isRecording ? <StopCircle size={24} /> : <Mic size={20} />}
                     </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#707090]">
            <div className="w-20 h-20 rounded-full bg-[#111119] flex items-center justify-center mb-4">
               <Send size={40} className="text-[#202030]" />
            </div>
            <p className="text-lg">{t.chat.selectChat}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
