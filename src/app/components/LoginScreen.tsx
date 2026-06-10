import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Crown, ChevronRight, Sparkles, ClipboardList, Headphones, RefreshCw, Camera, Heart } from 'lucide-react';
import { useApp } from '../App';
import { saveProfile } from '../../lib/api';
import { PlaylistButton } from './MainShell';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1608262941082-65cfdb51c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400';

interface Props { onLogin: (user?: any) => void; }

export function LoginScreen({ onLogin }: Props) {
  const { lang, setLang, pets, setShowPrivacyPolicy } = useApp();
  const [dogName, setDogName] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(DEFAULT_PHOTO);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const KO = lang === 'KO';
  const isReturningUser = pets && pets.length > 0;
  const firstPetName = pets?.[0]?.name || '';

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(KO ? '이미지 파일만 업로드할 수 있어요.' : 'Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(KO ? '파일 크기는 5MB 이하여야 해요.' : 'File size must be under 5MB.');
      return;
    }

    setPhotoFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 400;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

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
      let finalPhoto = DEFAULT_PHOTO;
      if (photoFile) {
        finalPhoto = await uploadPhoto(photoFile);
      }

      // Save the initial profile locally
      await saveProfile({
        name: targetName,
        breed: KO ? '믹스견' : 'Mixed Breed',
        photo: finalPhoto,
        birthdate: '2024-01',
        weight: 0,
        weightUnit: 'kg',
        lastVaccine: '',
        nextVet: ''
      });

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
      <div className="flex-1 flex flex-col justify-center px-5 relative z-10 pb-6">
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
            className="rounded-[32px] px-6 py-6"
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
              <form onSubmit={handleRegister} className="flex flex-col gap-3">
                <div className="mb-2">
                  <h2 className="text-[#1A2426] text-[1.2rem] font-black text-center tracking-tight mb-1">
                    {KO ? '나의 반려견 등록하기' : 'Register My Dog'}
                  </h2>
                  <p className="text-center text-[10px] font-semibold text-[#8a897e]">
                    {KO ? '반려견 정보를 입력하고 케어를 시작하세요' : 'Enter details to start personalized care'}
                  </p>
                </div>

                {/* ── Photo & Name Row ── */}
                <div className="flex items-center gap-4 mb-2">
                  {/* Photo Picker */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-[72px] h-[72px] rounded-full cursor-pointer group shadow-sm"
                      style={{ border: '2px solid #1A2426' }}
                    >
                      <img 
                        src={photoPreview} 
                        alt="Dog Profile Preview" 
                        className="w-full h-full object-cover rounded-full transition-opacity group-hover:opacity-90"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center transition-all">
                        <Camera size={16} className="text-white" />
                      </div>
                      <div 
                        className="absolute bottom-0 right-0 p-1.5 rounded-full shadow-md flex items-center justify-center"
                        style={{ background: '#1A2426' }}
                      >
                        <Camera size={10} className="text-white" />
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handlePhotoChange} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>

                  {/* Name Field */}
                  <div className="flex-1 relative">
                    <label className="block text-[11px] mb-1.5 font-bold uppercase tracking-wider pl-1" style={{ color: '#1F2937' }}>
                      {KO ? '반려견 이름' : 'Dog Name'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Heart size={14} className="absolute left-3.5 text-[#8a897e]" />
                      <input
                        type="text"
                        value={dogName}
                        onChange={e => setDogName(e.target.value)}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder={KO ? '예: 초코' : 'e.g. Bella'}
                        className="w-full pl-10 pr-3 py-3 rounded-2xl text-sm outline-none transition-all duration-300 font-semibold"
                        style={{
                          background: 'rgba(255,255,255,0.85)',
                          border: `2px solid ${focusedField === 'name' ? '#1A2426' : 'transparent'}`,
                          color: '#111827',
                          boxShadow: focusedField === 'name' ? '0 0 0 4px rgba(26, 36, 38, 0.08)' : 'none',
                        }}
                      />
                    </div>
                    {error && <p className="absolute -bottom-4 text-red-500 text-[10px] pl-1 font-medium leading-tight whitespace-nowrap">{error}</p>}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-3 rounded-2xl text-[14px] font-bold relative overflow-hidden flex items-center justify-center gap-2"
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

                <p className="text-center text-[10px] mt-0.5 font-medium" style={{ color: '#6B7280' }}>
                  {KO
                    ? '모든 기록은 기기에 안전하게 저장됩니다.'
                    : 'All records are stored safely on your device.'}
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
