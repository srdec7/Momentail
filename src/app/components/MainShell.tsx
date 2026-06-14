import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, ChevronDown, Plus, Check, Music, LogOut, Shield } from 'lucide-react';
import { useApp, LangToggle } from '../App';
import { ProfileTab } from './ProfileTab';
import { TimelineTab } from './TimelineTab';
import { InsightsTab } from './InsightsTab';
import { AudioPlayerModal } from './AudioPlayerModal';
import { PremiumModal } from './PremiumModal';


// ─── Pet Dropdown ─────────────────────────────────────────────────────────────
function PetDropdown() {
  const { pets, setPets, selectedPetIdx, setSelectedPetIdx, showProfileDropdown, setShowProfileDropdown, isPremium, setShowPremiumModal, lang, setShowPetFormModal, setEditingPet, setShowPrivacyPolicy } = useApp();
  const current = pets[selectedPetIdx];

  const handleAddPet = () => {
    if (!isPremium && pets.length >= 1) {
      setShowProfileDropdown(false);
      setShowPremiumModal(true);
      return;
    }
    setShowProfileDropdown(false);
    setEditingPet(null);      // null = add mode
    setShowPetFormModal(true);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
        className="flex items-center gap-2 rounded-2xl px-2 py-1.5 transition-all"
        style={{ background: showProfileDropdown ? 'rgba(26,36,33,0.1)' : 'transparent' }}
      >
        <div
          className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0"
          style={{ border: '2px solid rgba(62,109,82,0.4)' }}
        >
          <img src={current.photo} alt={current.name} className="w-full h-full object-cover" />
        </div>
        <div className="text-left min-w-0 max-w-[80px]">
          <p className="text-sm font-semibold leading-tight truncate" style={{ color: '#1A2421' }}>
            {current.name}
          </p>
          <p className="text-[11px] leading-tight truncate" style={{ color: '#5C6B64' }}>
            {current.breed}
          </p>
        </div>
        <ChevronDown
          size={14}
          style={{
            color: '#5C6B64',
            transform: showProfileDropdown ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      <AnimatePresence>
        {showProfileDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 left-0 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(240,236,228,0.96)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(44,54,57,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              minWidth: 180,
            }}
          >
            {pets.map((pet, i) => (
              <button
                key={pet.id}
                onClick={() => { setSelectedPetIdx(i); setShowProfileDropdown(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-all"
                style={{ background: i === selectedPetIdx ? 'rgba(162,123,92,0.12)' : 'transparent' }}
              >
                <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: '#2C3639' }}>{pet.name}</p>
                  <p className="text-[11px]" style={{ color: '#8a897e' }}>{pet.breed}</p>
                </div>
                {i === selectedPetIdx && <Check size={12} style={{ color: '#A27B5C' }} />}
              </button>
            ))}
            <div style={{ borderTop: '1px solid rgba(44,54,57,0.08)' }}>
              <button
                onClick={handleAddPet}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium transition-all"
                style={{ color: '#A27B5C' }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(162,123,92,0.15)' }}
                >
                  <Plus size={12} />
                </div>
                새 반려견 추가
                {!isPremium && pets.length >= 1 && (
                  <Crown size={10} className="ml-auto" style={{ color: '#A27B5C' }} />
                )}
              </button>
            </div>
            <div style={{ borderTop: '1px solid rgba(44,54,57,0.08)' }}>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setShowPrivacyPolicy(true);
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium transition-all"
                style={{ color: '#5C6B64' }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(92,107,100,0.1)' }}
                >
                  <Shield size={12} />
                </div>
                {lang === 'KO' ? '개인정보처리방침' : 'Privacy Policy'}
              </button>
            </div>
            <div style={{ borderTop: '1px solid rgba(44,54,57,0.08)' }}>
              <button
                onClick={() => {
                  // Clear all local data and restart
                  localStorage.removeItem('petory_profiles');
                  localStorage.removeItem('petory_timelines');
                  localStorage.removeItem('petory_premium');
                  window.location.reload();
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium transition-all"
                style={{ color: '#E87B7B' }}
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(232,123,123,0.1)' }}
                >
                  <LogOut size={12} />
                </div>
                {lang === 'KO' ? '로그아웃' : 'Logout'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: 'profile',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" />
        <path d="M5 20c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeLinecap="round" />
      </svg>
    ),
    labelKO: '프로필',
    labelEN: 'Profile',
  },
  {
    id: 'timeline',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" strokeWidth="1.8">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeLinecap="round" />
      </svg>
    ),
    labelKO: '활동',
    labelEN: 'Activity',
  },
  {
    id: 'insights',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" strokeWidth="1.8">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    labelKO: '인사이트',
    labelEN: 'Insights',
  },
  {
    id: 'playlist',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" strokeWidth="1.8">
        <path d="M9 18V5l12-2v13M9 9l12-2M6 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12-2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    labelKO: '플레이리스트',
    labelEN: 'Playlist',
  },
] as const;

// ─── Main Shell ───────────────────────────────────────────────────────────────
export function MainShell() {
  const { activeTab, setActiveTab, lang, isPremium, setShowPremiumModal, showAudioModal, setShowAudioModal, isAudioPlaying } = useApp();
  const KO = lang === 'KO';

  const TAB_MAP = {
    profile: <ProfileTab />,
    timeline: <TimelineTab />,
    insights: <InsightsTab />,
  };

  return (
    <div
      className="flex flex-col w-full h-full relative overflow-hidden"
      style={{ background: '#DCD7C9' }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 w-full relative"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          background: 'rgba(220,215,201,0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(44,54,57,0.06)',
          zIndex: 30,
        }}
      >
        <div className="flex items-center justify-between px-4 relative" style={{ paddingTop: 12, paddingBottom: 10 }}>
          {/* Pet selector */}
          <PetDropdown />

          {/* Logo center */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">
            <div className="w-[90px] h-[90px] flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Momentail Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Right: Lang Toggle */}
          <div className="flex flex-col items-end gap-1.5 mt-1">
            <LangToggle />
          </div>
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 overflow-y-auto overflow-x-hidden petory-scroll"
          >
            {TAB_MAP[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Nav ── */}
      <div className="relative z-20 pb-8 pt-4 px-6 mt-auto">
        <div
          className="flex items-center justify-around rounded-[32px] py-3.5 shadow-xl border border-[rgba(255,255,255,0.4)]"
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            const isPlaylist = item.id === 'playlist';
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isPlaylist) {
                    setShowAudioModal(true);
                  } else {
                    setActiveTab(item.id as any);
                  }
                }}
                className="flex flex-col items-center gap-1 relative px-4"
              >
                <div
                  className="transition-all duration-300 relative"
                  style={{ color: (isActive || (isPlaylist && isAudioPlaying)) ? '#3E6D52' : '#8a8e8b' }}
                >
                  {item.icon}
                  {isPlaylist && isAudioPlaying && (
                    <div className="absolute -top-1 -right-2 flex items-end gap-[1px] h-[8px]">
                      {[1, 2, 3].map(i => (
                        <span
                          key={i}
                          className={`block rounded-full music-bar-${i}`}
                          style={{ width: 1.5, height: 8, background: '#10B981', transformOrigin: 'bottom' }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: isActive ? '#3E6D52' : '#8A9E96' }}
                >
                  {KO ? item.labelKO : item.labelEN}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-1 h-1 rounded-full"
                    style={{ background: '#3E6D52' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}