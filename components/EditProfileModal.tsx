
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Save, ShieldCheck, ChevronRight, AlertCircle, PenTool, Eraser } from 'lucide-react';
import { User } from '../types';

interface EditProfileModalProps {
  currentUser: User;
  onClose: () => void;
  onSave: (updates: Partial<User>) => void;
  onRequestOfficial: () => void;
  hasAppliedOfficial: boolean;
  t: any;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentUser, onClose, onSave, onRequestOfficial, hasAppliedOfficial, t }) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    handle: currentUser.handle,
    bio: currentUser.bio || '',
    avatar: currentUser.avatar
  });
  
  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | undefined>(currentUser.banner);

  useEffect(() => {
    // Initialize canvas with existing banner if available
    const canvas = canvasRef.current;
    if (canvas && bannerImage) {
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = bannerImage;
    }
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setBannerImage(canvas.toDataURL());
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
       x = e.touches[0].clientX - rect.left;
       y = e.touches[0].clientY - rect.top;
    } else {
       x = (e as React.MouseEvent).clientX - rect.left;
       y = (e as React.MouseEvent).clientY - rect.top;
    }

    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5B8CFF'; // Primary color for drawing

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setBannerImage(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
       ...formData,
       banner: bannerImage
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111119] border border-[#202030] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#202030] shrink-0">
          <h2 className="text-[#F5F5FA] font-semibold">{t.profile.edit}</h2>
          <button onClick={onClose} className="text-[#A0A0C0] hover:text-[#F5F5FA] transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Avatar Preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group cursor-pointer">
              <img src={formData.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-[#202030] object-cover" />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera size={24} className="text-white" />
              </div>
            </div>
             <input 
              type="text" 
              placeholder="Avatar URL"
              value={formData.avatar}
              onChange={(e) => setFormData({...formData, avatar: e.target.value})}
              className="mt-4 w-full bg-[#0B0B10] border border-[#202030] rounded-lg px-3 py-2 text-sm text-[#F5F5FA] placeholder-[#707090] outline-none focus:border-[#5B8CFF]"
            />
          </div>

          <div className="space-y-1">
             <label className="text-xs text-[#707090] uppercase font-bold ml-1">{t.auth.name}</label>
             <input 
              type="text" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-[#0B0B10] border border-[#202030] rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#5B8CFF] transition-colors"
            />
          </div>

          <div className="space-y-1">
             <label className="text-xs text-[#707090] uppercase font-bold ml-1">{t.auth.handle}</label>
             <input 
              type="text" 
              required
              value={formData.handle}
              onChange={(e) => setFormData({...formData, handle: e.target.value})}
              className="w-full bg-[#0B0B10] border border-[#202030] rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#5B8CFF] transition-colors"
            />
          </div>

          <div className="space-y-1">
             <label className="text-xs text-[#707090] uppercase font-bold ml-1">{t.profile.bio}</label>
             <textarea 
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full bg-[#0B0B10] border border-[#202030] rounded-xl px-4 py-3 text-[#F5F5FA] outline-none focus:border-[#5B8CFF] transition-colors resize-none"
            />
          </div>

          {/* Canvas Banner Drawing */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
               <label className="text-xs text-[#707090] uppercase font-bold ml-1">{t.profile.drawBanner}</label>
               <button 
                type="button" 
                onClick={clearCanvas} 
                className="text-xs text-[#FF5B5B] flex items-center gap-1 hover:underline"
               >
                 <Eraser size={12} /> {t.profile.clearCanvas}
               </button>
            </div>
            <div className="border border-[#202030] rounded-xl overflow-hidden bg-[#0B0B10] touch-none">
               <canvas 
                 ref={canvasRef}
                 width={400}
                 height={150}
                 className="w-full h-auto cursor-crosshair block"
                 onMouseDown={(e) => {
                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    ctx?.beginPath(); // Reset path
                    startDrawing(e);
                 }}
                 onMouseMove={draw}
                 onMouseUp={stopDrawing}
                 onMouseLeave={stopDrawing}
                 onTouchStart={(e) => {
                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    ctx?.beginPath();
                    startDrawing(e);
                 }}
                 onTouchMove={draw}
                 onTouchEnd={stopDrawing}
               />
            </div>
            <p className="text-[10px] text-[#707090] italic">Draw something unique for your profile header.</p>
          </div>

          {/* Official Status Request Section */}
          {!currentUser.isOfficial && (
             <div className="pt-4 border-t border-[#202030] mt-4">
                <label className="text-xs text-[#707090] uppercase font-bold ml-1 mb-2 block">Verification</label>
                <button 
                  type="button"
                  onClick={onRequestOfficial}
                  disabled={hasAppliedOfficial}
                  className="w-full flex items-center justify-between p-3 bg-[#15151f] border border-[#202030] rounded-xl hover:bg-[#202030] transition-colors group disabled:opacity-50"
                >
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={18} className="text-[#A0A0C0] group-hover:text-yellow-400 transition-colors" />
                      <span className="text-[#F5F5FA] text-sm font-medium">
                         {hasAppliedOfficial ? t.settings.officialPending : t.settings.officialRequest}
                      </span>
                   </div>
                   {!hasAppliedOfficial && <ChevronRight size={16} className="text-[#707090]" />}
                </button>
             </div>
          )}

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-[#5B8CFF] to-[#7B5BFF] text-white py-3.5 rounded-xl font-bold mt-4 hover:shadow-[0_0_20px_rgba(91,140,255,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {t.profile.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
