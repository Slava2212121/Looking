import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, AtSign, ArrowRight, ShieldCheck, KeyRound, Terminal, AlertTriangle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { Language } from '../types';

// --- CONFIGURATION START ---
// Ваши ключи EmailJS
const EMAILJS_SERVICE_ID = 'service_k0gy4oj';
const EMAILJS_TEMPLATE_ID = 'template_kv0ea3h';
const EMAILJS_PUBLIC_KEY = 'Pza0COcO4XZpSKFLe';
// --- CONFIGURATION END ---

interface AuthScreenProps {
  onLogin: (userData?: { name: string; handle: string; email: string }) => void;
  existingEmails: string[];
  lang: Language;
  setLang: (lang: Language) => void;
  t: any;
  Logo?: React.FC;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, existingEmails, lang, setLang, t, Logo }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [step, setStep] = useState<'INPUT' | 'VERIFY' | 'RESET_NEW_PASS'>('INPUT');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    newPassword: '',
    name: '',
    handle: ''
  });

  // Explicit initialization of EmailJS on mount
  useEffect(() => {
    if (EMAILJS_PUBLIC_KEY) {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
      } catch (e) {
        console.error('EmailJS Init Error:', e);
      }
    }
  }, []);

  const handleInitAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsDemoMode(false);

    // --- REQUIREMENT: Only Mail.ru (and aliases) and Gmail ---
    const allowedDomains = /@(gmail\.com|mail\.ru|inbox\.ru|list\.ru|bk\.ru)$/i;

    if (!allowedDomains.test(formData.email)) {
      setError(t.auth.invalidDomain);
      return;
    }

    // --- REQUIREMENT: One account per email (Mock Check) ---
    if (mode === 'REGISTER' && existingEmails.includes(formData.email)) {
       setError(t.auth.emailTaken);
       return;
    }

    setIsLoading(true);
    
    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      // Basic check to ensure keys are not empty
      if (!EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error('EmailJS keys are missing');
      }

      // Attempt to send real email
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          // Variables must match your EmailJS template {{variables}}
          email: formData.email,    
          passcode: code,           
          time: new Date().toLocaleTimeString(), 
          to_name: formData.name || 'User', // Fallback for Login mode where name isn't provided
          from_name: 'Blend' 
        }
        // Note: Public key is already initialized in useEffect, but passing it here is safe too
      );

      console.log('✅ Email sent successfully to:', formData.email);
      setSuccessMessage(`Code sent to ${formData.email}`);
      
      // ONLY Move to next step if email sent successfully
      setStep('VERIFY');

    } catch (err: any) {
      console.error('⚠️ Email send failed:', err);
      
      // Extract meaningful error text
      let errorMsg = 'Failed to send email.';
      if (err.text) errorMsg += ` (${err.text})`;
      else if (err.message) errorMsg += ` (${err.message})`;
      
      // If it's a limit issue or network issue, suggest Demo Mode
      setError(`${errorMsg} Try Demo Mode.`);
      
      // IMPORTANT: In case of error, we DO NOT move to VERIFY automatically
      // so the user sees the error message.
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      setIsLoading(false);
      // Verify against the generated code
      if (verificationCode === generatedCode) {
        if (mode === 'REGISTER') {
          onLogin({ 
             name: formData.name, 
             handle: formData.handle.startsWith('@') ? formData.handle : `@${formData.handle}`,
             email: formData.email
          });
        } else if (mode === 'FORGOT') {
           setStep('RESET_NEW_PASS');
        } else {
          // LOGIN
          onLogin({ 
            name: '', // Handled in App.tsx based on email or default
            handle: '', 
            email: formData.email 
          }); 
        }
      } else {
        setError(t.auth.wrongCode);
      }
    }, 1000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
     e.preventDefault();
     setIsLoading(true);
     setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(t.auth.passwordResetSuccess);
        // Reset to Login
        setMode('LOGIN');
        setStep('INPUT');
        setFormData({ ...formData, password: '' }); 
     }, 1500);
  };

  // Helper to force demo mode manually if email fails
  const triggerManualDemo = () => {
      setError('');
      setIsDemoMode(true);
      setStep('VERIFY');
      setGeneratedCode('123456'); // Simple code for manual demo trigger
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--primary)]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--primary)]/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex gap-2">
         {(['en', 'ru', 'zh'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase border border-[var(--border)] transition-colors ${
                lang === l ? 'bg-[var(--bg-card)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {l}
            </button>
          ))}
      </div>

      <div className="w-full max-w-md bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-8 shadow-2xl z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Header with Logo */}
        <div className="flex flex-col items-center mb-8">
          {Logo ? <div className="mb-4 scale-150"><Logo /></div> : (
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] flex items-center justify-center text-white font-black text-3xl shadow-lg mb-4">
                B
             </div>
          )}
          <h1 className="text-3xl font-extrabold text-[var(--text-main)] mb-1">Blend</h1>
          <p className="text-[var(--text-muted)] text-center">{t.auth.subtitle}</p>
        </div>

        {successMessage && (
           <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 text-green-500 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2">
              {successMessage}
           </div>
        )}

        {/* Global Error Display with Action */}
        {error && (
            <div className="mb-4 p-3 bg-[#FF5B5B]/10 border border-[#FF5B5B]/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                <p className="text-[#FF5B5B] text-sm text-center mb-2">{error}</p>
                {/* If error occurs, offer Demo Mode immediately */}
                <button 
                    onClick={triggerManualDemo}
                    className="w-full py-1.5 bg-[#FF5B5B]/20 hover:bg-[#FF5B5B]/30 text-[#FF5B5B] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Terminal size={12} />
                    Switch to Demo Mode
                </button>
            </div>
        )}

        {step === 'INPUT' ? (
          /* Step 1: Login/Register/Forgot Inputs */
          <form onSubmit={handleInitAuth} className="space-y-4">
            
            {mode === 'REGISTER' && (
              <>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    placeholder={t.auth.name}
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] outline-none transition-colors"
                  />
                </div>
                <div className="relative group">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                  <input 
                    type="text" 
                    required
                    placeholder={t.auth.handle}
                    value={formData.handle}
                    onChange={e => setFormData({...formData, handle: e.target.value})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] outline-none transition-colors"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <div className="relative group">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-[#FF5B5B]' : 'text-[var(--text-muted)] group-focus-within:text-[var(--primary)]'}`} size={20} />
                <input 
                  type="email" 
                  required
                  placeholder={t.auth.email}
                  value={formData.email}
                  onChange={e => {
                    setFormData({...formData, email: e.target.value});
                    setError('');
                  }}
                  className={`w-full bg-[var(--bg-main)] border rounded-xl py-3 pl-10 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none transition-colors ${error ? 'border-[#FF5B5B]' : 'border-[var(--border)] focus:border-[var(--primary)]'}`}
                />
              </div>
            </div>

            {mode !== 'FORGOT' && (
               <div className="relative group">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                 <input 
                   type="password" 
                   required
                   placeholder={t.auth.password}
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] outline-none transition-colors"
                 />
               </div>
            )}
            
            {mode === 'LOGIN' && (
               <div className="flex justify-end">
                  <button 
                     type="button" 
                     onClick={() => { setMode('FORGOT'); setError(''); }}
                     className="text-xs text-[var(--text-muted)] hover:text-[var(--primary)]"
                  >
                     {t.auth.forgotPassword}
                  </button>
               </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'LOGIN' ? t.auth.submitLogin : (mode === 'REGISTER' ? t.auth.submitRegister : t.auth.sendRecovery)}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        ) : step === 'VERIFY' ? (
          /* Step 2: 2FA Verification */
          <form onSubmit={handleVerify} className="space-y-6">
             <div className="text-center">
                <div className="w-16 h-16 bg-[var(--primary)]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--primary)]">
                   <ShieldCheck size={32} />
                </div>
                <h3 className="text-[var(--text-main)] text-xl font-bold mb-2">{t.auth.securityCheck}</h3>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  {isDemoMode ? t.auth.codeSent + ' (Demo Mode)' : successMessage || t.auth.codeSent}
                </p>
             </div>
             
             {/* DEMO CODE DISPLAY - Only visible in Demo Mode */}
             {isDemoMode && (
               <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] p-4 rounded-xl mb-6 text-center animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                     <Terminal size={16} />
                     <p className="text-xs font-bold uppercase tracking-wider">Demo Simulation</p>
                  </div>
                  <p className="text-sm opacity-80 mb-1">Email service not configured. Use this:</p>
                  <p className="text-3xl font-mono font-black tracking-[0.5em] select-all cursor-pointer hover:scale-105 transition-transform">{generatedCode}</p>
               </div>
             )}

             <div className="relative group">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="------"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] outline-none transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                />
             </div>
             
             <button 
              type="submit"
              disabled={isLoading || verificationCode.length < 6}
              className="w-full bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t.auth.verify
              )}
            </button>
            
            <button 
              type="button"
              onClick={() => setStep('INPUT')}
              className="w-full text-[var(--text-muted)] text-sm hover:text-[var(--text-main)] mt-4"
            >
               {t.auth.resend}
            </button>

            {!isDemoMode && (
                <button 
                    type="button"
                    onClick={triggerManualDemo}
                    className="w-full text-[var(--text-muted)] text-xs hover:text-[var(--primary)] mt-4 underline decoration-dotted opacity-70 hover:opacity-100 transition-opacity"
                >
                    {t.auth.troubleReceiving || 'Trouble receiving code?'}
                </button>
            )}
            
          </form>
        ) : (
          /* Step 3: Reset Password (New) */
          <form onSubmit={handleResetPassword} className="space-y-4">
             <div className="text-center mb-6">
                <h3 className="text-[var(--text-main)] text-xl font-bold">{t.auth.resetPassword}</h3>
             </div>
             
             <div className="relative group">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                 <input 
                   type="password" 
                   required
                   placeholder={t.auth.newPassword}
                   value={formData.newPassword}
                   onChange={e => setFormData({...formData, newPassword: e.target.value})}
                   className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:border-[var(--primary)] outline-none transition-colors"
                 />
             </div>

             <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-white py-3.5 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t.auth.resetPassword
              )}
            </button>
          </form>
        )}

        {/* Toggle Mode */}
        {step === 'INPUT' && (
          <div className="mt-6 text-center">
            {mode === 'FORGOT' ? (
               <button 
                onClick={() => setMode('LOGIN')}
                className="text-[var(--text-muted)] text-sm hover:text-[var(--text-main)]"
               >
                 {t.auth.backToLogin}
               </button>
            ) : (
              <p className="text-[var(--text-muted)] text-sm">
                {mode === 'LOGIN' ? t.auth.noAccount : t.auth.haveAccount}{' '}
                <button 
                  onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                  className="text-[var(--primary)] hover:underline font-medium"
                >
                  {mode === 'LOGIN' ? t.auth.register : t.auth.login}
                </button>
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthScreen;