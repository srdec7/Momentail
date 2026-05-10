import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, Eye, EyeOff, ChevronRight, Sparkles, ClipboardList, Headphones } from 'lucide-react';
import { useApp } from '../App';
import { supabase } from '../../lib/supabase';

interface Props { onLogin: (user?: any) => void; }

export function LoginScreen({ onLogin }: Props) {
  const { lang, setLang, setShowPremiumModal } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const KO = lang === 'KO';

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    
    let targetEmail = email.trim();
    let targetPassword = password;

    // Master Key: instant bypass, no Supabase call needed
    if (targetEmail === 'master0827' || targetEmail === '[master0827]' || password === '[master0827]') {
      onLogin({ id: null, email: 'master@petory.app' });
      return;
    }

    if (!targetEmail || !targetPassword) {
      setError(KO ? '이메일과 비밀번호를 입력해주세요.' : 'Please enter email and password.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Try signing in first
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: targetEmail, password: targetPassword });
      if (!signInError && data?.user) {
        onLogin(data.user);
        return;
      }

      // 2. If user doesn't exist, auto sign up
      if (signInError && signInError.message.toLowerCase().includes('invalid login')) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: targetEmail, password: targetPassword });
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            throw new Error(lang === 'EN' ? 'Incorrect password for existing account.' : '기존 계정의 비밀번호가 일치하지 않습니다.');
          }
          throw signUpError;
        }
        
        if (signUpData?.user) {
          onLogin(signUpData.user);
          return;
        }
      } else if (signInError) {
        throw signInError;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full overflow-y-auto flex flex-col font-sans">
      {/* ── Background Layer ── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/bg-dogs.png")',
          backgroundColor: '#9FB198' // Sage green fallback
        }}
      />
      
      {/* Soft Nature Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{ 
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.1) 100%)' 
        }}
      />

      {/* ── Top Navigation ── */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2">
        {/* Lang toggle (Nature Glass Style) */}
        <div
          className="flex items-center rounded-full p-1 gap-0.5 shadow-sm"
          style={{ background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}
        >
          {(['EN', 'KO'] as const).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="px-3 py-1 rounded-full text-xs transition-all duration-300"
              style={{
                background: lang === l ? '#1A2426' : 'transparent',
                color: lang === l ? '#FFFFFF' : '#4B5563',
                fontWeight: lang === l ? 700 : 500,
              }}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Premium badge (Midnight Green) */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPremiumModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, #2A3638 0%, #1A2426 100%)',
            color: '#fff',
            boxShadow: '0 4px 15px rgba(26,36,38,0.25)',
          }}
        >
          <Crown size={12} strokeWidth={2.5} />
          {KO ? '프리미엄' : 'Premium'}
        </motion.button>
      </div>
      {/* ── Hero Section (Floating Logo Only) ── */}
      <div className="relative z-10 flex flex-col items-center mt-2 mb-2 px-6 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mb-1"
        >
          <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Momentail Logo" 
              className="w-full h-full object-contain drop-shadow-lg" 
            />
          </div>
        </motion.div>
      </div>

      {/* ── Forest Glass Login Card ── */}
      <div className="flex-1 flex flex-col justify-start px-5 relative z-10 pt-[110px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          <form
            className="rounded-[40px] px-7 py-5"
            style={{
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 20px 40px -10px rgba(26, 36, 38, 0.1)',
            }}
            onSubmit={handleLogin}
          >
            <h2 className="mb-4 text-[#1A2426] text-[1.25rem] font-black text-center tracking-tight">
              {KO ? '케어 시작하기' : 'Start Caring'}
            </h2>

            {/* Email Field */}
            <div className="mb-2.5">
              <label className="block text-[12px] mb-1 font-bold uppercase tracking-wider pl-1" style={{ color: '#1F2937' }}>
                {KO ? '이메일 계정' : 'Email Account'}
              </label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="petory@example.com"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.85)',
                  border: `2px solid ${focusedField === 'email' ? '#1A2426' : 'transparent'}`,
                  color: '#111827',
                }}
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-[12px] mb-1 font-bold uppercase tracking-wider pl-1" style={{ color: '#1F2937' }}>
                {KO ? '비밀번호' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('pw')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-2xl text-sm outline-none transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    border: `2px solid ${focusedField === 'pw' ? '#1A2426' : 'transparent'}`,
                    color: '#111827',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  style={{ color: '#1A2426' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Login Button (Midnight Green) */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl text-[14px] font-bold relative overflow-hidden flex items-center justify-center gap-2"
              style={{
                background: isLoading
                  ? '#9CA3AF'
                  : 'linear-gradient(135deg, #2A3638 0%, #1A2426 100%)',
                color: '#fff',
                boxShadow: isLoading ? 'none' : '0 10px 20px -5px rgba(26,36,38,0.3)',
              }}
            >
              {isLoading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <>
                  <span>{KO ? '모멘테일 로그인' : 'Login to Momentail'}</span>
                  <ChevronRight size={16} strokeWidth={3} />
                </>
              )}
            </motion.button>

            <p className="text-center text-[10px] mt-2.5 font-medium" style={{ color: '#6B7280' }}>
              {KO
                ? '새로운 계정은 자동으로 가입됩니다.'
                : 'New accounts are registered instantly.'}
            </p>
          </form>
        </motion.div>
      </div>

      {/* ── Footer Info ── */}
      <div className="relative z-10 py-4 px-6 text-center">
        <div className="flex justify-center gap-6 mb-3">
          <div className="flex flex-col items-center gap-1 opacity-70">
            <Sparkles size={16} className="text-[#1A2426]" />
            <span className="text-[9px] font-bold uppercase tracking-tight" style={{ color: '#1A2426' }}>AI Intelligence</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-70">
            <ClipboardList size={16} className="text-[#1A2426]" />
            <span className="text-[9px] font-bold uppercase tracking-tight" style={{ color: '#1A2426' }}>Activity</span>
          </div>
          <div className="flex flex-col items-center gap-1 opacity-70">
            <Headphones size={16} className="text-[#1A2426]" />
            <span className="text-[9px] font-bold uppercase tracking-tight" style={{ color: '#1A2426' }}>Therapy</span>
          </div>
        </div>
        <p className="text-[11px] font-semibold" style={{ color: '#1A2426', opacity: 0.8 }}>
          {KO ? '반려견의 건강을 기록하고 사랑을 나누세요' : 'Cherish every moment with your dog'}
        </p>
      </div>
    </div>
  );
}
