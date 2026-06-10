import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Crown, ChevronRight, Sparkles, ClipboardList, Headphones, RefreshCw } from 'lucide-react';
import { useApp } from '../App';
import { saveProfile } from '../../lib/api';
import { PlaylistButton } from './MainShell';

interface Props { onLogin: (user?: any) => void; }

export function LoginScreen({ onLogin }: Props) {
  const { lang, setLang, pets, setShowPrivacyPolicy } = useApp();
  const [dogName, setDogName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const KO = lang === 'KO';
  const isReturningUser = pets && pets.length > 0;
  const firstPetName = pets?.[0]?.name || '';

  const handleContinue = () => {
    onLogin({ isLocal: true });
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    
    let targetName = dogName.trim();

    if (!targetName) {
      setError(KO ? '반려견의 이름을 입력해주세요.' : 'Please enter your dog\'s name.');
      return;
    }

    setIsLoading(true);
    try {
      // Save the initial profile locally
      await saveProfile({ name: targetName });
      // Proceed to main shell
      onLogin({ isLocal: true });
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
        className="absolute inset-0 z-0 bg-cover bg-top bg-no-repeat"
        style={{ 
          backgroundImage: 'url("/bg-dogs.png")',
          backgroundColor: '#9FB198' // Sage green fallback
        }}
      />
      
      {/* Soft Nature Overlay */}
      <div 
        className="absolute inset-0 z-0"
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

        {/* Playlist Button */}
        <PlaylistButton />
      </div>
      
      {/* ── Hero Section (Floating Logo Only) ── */}
      <div className="relative z-10 flex flex-col items-center mt-0 sm:mt-8 mb-0 sm:mb-2 px-6 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
          className="mb-1"
        >
          <div className="w-30 h-30 flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.png" 
              alt="Momentail Logo" 
              className="w-full h-full object-contain drop-shadow-lg" 
            />
          </div>
        </motion.div>
      </div>

      {/* ── Forest Glass Registration Card ── */}
      <div className="flex-1 flex flex-col justify-start px-5 relative z-10 pt-[85px] sm:pt-[140px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ willChange: 'transform, opacity' }}
        >
          <div
            className="rounded-[40px] px-7 py-5"
            style={{
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 20px 40px -10px rgba(26, 36, 38, 0.1)',
            }}
          >
            {isReturningUser ? (
              /* ── Returning User UI ── */
              <>
                <div className="text-center mb-5">
                  <p className="text-[12px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8a897e' }}>
                    {KO ? '다시 돌아오셨군요!' : 'Welcome back!'}
                  </p>
                  <h2 className="text-[1.3rem] font-black text-[#1A2426] tracking-tight">
                    {KO ? `${firstPetName}의 케어를` : `Continue caring`}
                  </h2>
                  <h2 className="text-[1.3rem] font-black text-[#1A2426] tracking-tight">
                    {KO ? '이어서 시작할게요 🐾' : `for ${firstPetName} 🐾`}
                  </h2>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleContinue}
                  className="w-full py-3.5 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #2A3638 0%, #1A2426 100%)',
                    color: '#fff',
                    boxShadow: '0 10px 20px -5px rgba(26,36,38,0.3)',
                  }}
                >
                  <span>{KO ? '이어서 시작하기' : 'Continue'}</span>
                  <ChevronRight size={16} strokeWidth={3} />
                </motion.button>

              </>
            ) : (
              /* ── New User Registration UI ── */
              <form onSubmit={handleRegister}>
                <h2 className="mb-4 text-[#1A2426] text-[1.25rem] font-black text-center tracking-tight">
                  {KO ? '나의 반려견 등록하기' : 'Register My Dog'}
                </h2>

                <div className="mb-4">
                  <label className="block text-[12px] mb-1 font-bold uppercase tracking-wider pl-1" style={{ color: '#1F2937' }}>
                    {KO ? '반려견 이름' : 'Dog Name'}
                  </label>
                  <input
                    type="text"
                    value={dogName}
                    onChange={e => setDogName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={KO ? '예: 초코, 보리' : 'e.g. Max, Bella'}
                    className="w-full px-4 py-3 rounded-2xl text-sm outline-none transition-all duration-300"
                    style={{
                      background: 'rgba(255,255,255,0.85)',
                      border: `2px solid ${focusedField === 'name' ? '#1A2426' : 'transparent'}`,
                      color: '#111827',
                    }}
                  />
                  {error && <p className="text-red-500 text-xs mt-1 pl-1 font-medium">{error}</p>}
                </div>

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
                      <span>{KO ? '케어 시작하기' : 'Start Caring'}</span>
                      <ChevronRight size={16} strokeWidth={3} />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-[10px] mt-2.5 font-medium" style={{ color: '#6B7280' }}>
                  {KO
                    ? '모든 기록은 이 기기에만 안전하게 저장됩니다.'
                    : 'All records are stored locally on your device.'}
                </p>
              </form>
            )}
          </div>
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
        <button
          type="button"
          onClick={() => setShowPrivacyPolicy(true)}
          className="mt-3 text-[10px] font-medium underline"
          style={{ color: '#1A2426', opacity: 0.6 }}
        >
          {KO ? '개인정보처리방침' : 'Privacy Policy'}
        </button>
      </div>
    </div>
  );
}
