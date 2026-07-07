import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { MainShell } from './components/MainShell';
import { getProfiles, getTimeline } from '../lib/api';
import { initializeIAP, checkPremiumStatus } from '../lib/iap';
import { initializeAdMob, onInterstitialRequest, dismissMockInterstitial } from '../lib/admob';
import { TRACKS, AudioPlayerModal } from './components/AudioPlayerModal';
import { PetFormModal } from './components/PetFormModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { PremiumModal } from './components/PremiumModal';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type Lang = 'KO' | 'EN';
export type TabType = 'profile' | 'timeline' | 'insights';
export type ActivityType = 'meal' | 'walk' | 'sleep' | 'toilet' | 'vet' | 'bath' | 'other';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  birthdate: string; // 'YYYY-MM'
  photo: string;
  weight: number;
  weightUnit: 'kg' | 'lbs';
  lastVaccine: string; // 'YYYY-MM-DD'
  nextVet: string;    // 'YYYY-MM-DD'
}

export interface TimelineEntry {
  id: string;
  petId: string;
  type: ActivityType;
  time: string; // 'HH:mm'
  date: string; // 'YYYY-MM-DD'
  note: string;
  value?: number;
  unit?: string;
}

const DEFAULT_PET_PHOTO = 'https://images.unsplash.com/photo-1608262941082-65cfdb51c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400';

function profileToPet(p: any): Pet {
  return {
    id: p.id,
    name: p.name || 'My Pet',
    breed: p.breed || '',
    birthdate: p.birthdate || '2024-01',
    photo: p.photo || DEFAULT_PET_PHOTO,
    weight: parseFloat(p.weight) || 0,
    weightUnit: p.weightUnit || 'kg',
    lastVaccine: p.lastVaccine || '',
    nextVet: p.nextVet || ''
  };
}

function loadCachedPets(): Pet[] {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem('petory_profiles');
    const profiles = raw ? JSON.parse(raw) : [];
    return Array.isArray(profiles) ? profiles.map(profileToPet) : [];
  } catch (e) {
    console.error('Error reading cached pets', e);
    return [];
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
export interface AppContextType {
  user: any;
  lang: Lang;
  setLang: (l: Lang) => void;
  isPremium: boolean;
  setIsPremium: (v: boolean) => void;
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
  selectedPetIdx: number;
  setSelectedPetIdx: (i: number) => void;
  timeline: TimelineEntry[];
  setTimeline: React.Dispatch<React.SetStateAction<TimelineEntry[]>>;
  isAudioPlaying: boolean;
  setIsAudioPlaying: (v: boolean) => void;
  currentTrackIdx: number;
  setCurrentTrackIdx: (i: number) => void;
  showAudioModal: boolean;
  setShowAudioModal: (v: boolean) => void;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (v: boolean) => void;
  showPetFormModal: boolean;
  setShowPetFormModal: (v: boolean) => void;
  showPrivacyPolicy: boolean;
  setShowPrivacyPolicy: (v: boolean) => void;
  showPremiumModal: boolean;
  setShowPremiumModal: (v: boolean) => void;
  editingPet: Pet | null;
  setEditingPet: (p: Pet | null) => void;
  audioCurrentTime: number;
  audioDuration: number;
  seekAudio: (time: number) => void;
  returnToWelcome: () => void;
}

export const AppContext = createContext<AppContextType>(null!);
export const useApp = () => useContext(AppContext);

// ─── App Component ────────────────────────────────────────────────────────────
export function LangToggle() {
  const { lang, setLang } = useApp();
  return (
    <div
      className="flex items-center rounded-full p-0.5 gap-0.5 shadow-sm shrink-0 pointer-events-auto"
      style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)' }}
    >
      {(['EN', 'KO'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-2.5 py-1 rounded-full text-[10px] transition-all duration-300"
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
  );
}

// Mock Interstitial Ad Component
function MockInterstitialAd({ visible }: { visible: boolean }) {
  const [countdown, setCountdown] = React.useState(5);

  React.useEffect(() => {
    if (!visible) { setCountdown(5); return; }
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); dismissMockInterstitial(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[90] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.9)' }}
    >
      <div
        className="w-full mx-4 rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(145deg, #1a2d22, #243b2c)', maxWidth: 340, boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}
      >
        {/* Skip button */}
        <button
          onClick={dismissMockInterstitial}
          className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700 }}
        >
          {countdown > 0 ? `${countdown}초 후 닫기` : <><X size={11} /> 닫기</>}
        </button>

        {/* Ad Content */}
        <div className="p-8 text-center">
          <div className="text-[10px] font-bold mb-4" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>ADVERTISEMENT</div>
          <div
            className="w-20 h-20 rounded-[24px] mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', boxShadow: '0 12px 30px rgba(245,158,11,0.4)' }}
          >
            <span style={{ fontSize: 40 }}>🐾</span>
          </div>
          <h3 className="text-xl font-black text-white mb-2">Guardian Family Pack</h3>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>광고 없는 완벽한 반려견 케어 경험</p>
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="text-base line-through" style={{ color: 'rgba(255,255,255,0.3)' }}>$9.99</span>
            <span className="text-3xl font-black" style={{ color: '#FCD34D' }}>$3.99</span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(252,211,77,0.2)', color: '#FCD34D' }}>평생</span>
          </div>
          <button
            onClick={dismissMockInterstitial}
            className="w-full py-3.5 rounded-2xl font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', color: '#78350F' }}
          >
            지금 업그레이드하기
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── App Component ────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [petsLoaded, setPetsLoaded] = useState(false);
  const [lang, setLang] = useState<Lang>('EN');
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [pets, setPets] = useState<Pet[]>(() => loadCachedPets());
  const [selectedPetIdx, setSelectedPetIdx] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPetFormModal, setShowPetFormModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPrivacyRoute, setIsPrivacyRoute] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [mockInterstitialVisible, setMockInterstitialVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAudioPlaying, currentTrackIdx]);

  const handleAudioEnded = () => {
    const nextIdx = (currentTrackIdx + 1) % TRACKS.length;
    setCurrentTrackIdx(nextIdx);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setAudioCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setAudioDuration(audioRef.current.duration);
  };

  const seekAudio = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setAudioCurrentTime(time);
    }
  };

  const returnToWelcome = () => {
    setShowProfileDropdown(false);
    setShowAudioModal(false);
    setShowPetFormModal(false);
    setShowPrivacyPolicy(false);
    setShowPremiumModal(false);
    setActiveTab('profile');
    setUser(null);
  };

  // Check ?premium=success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('premium') === 'success') {
      setIsPremium(true);
      localStorage.setItem('petory_premium', 'true');
      window.history.replaceState({}, document.title, window.location.pathname);
      alert(lang === 'KO' ? '프리미엄 결제가 완료되었습니다! 🎉' : 'Family Pack Unlocked! 🎉');
    }
  }, [lang]);



  // ─── Local-First Initialization ──────────────────────────────────────────────────
  // On mount: preload pets into state so LoginScreen can detect returning users.
  // Always show LoginScreen first - user must tap to enter.
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/privacy' || path === '/privacy.html') {
      setIsPrivacyRoute(true);
    }

    // Initialize AdMob
    console.log('[PetoryAds] App mounted; initializing ads', { platform: (window as any).Capacitor?.getPlatform?.() });
    initializeAdMob().catch(error => console.error('[PetoryAds] Initial AdMob init failed', error));
    const adInitTimer = window.setTimeout(() => {
      console.log('[PetoryAds] Retrying delayed AdMob init');
      initializeAdMob().catch(error => console.error('[PetoryAds] Delayed AdMob init failed', error));
    }, 1200);

    // Initialize IAP and check premium status
    initializeIAP().then(() => {
      checkPremiumStatus().then((isPro) => {
        setIsPremium(isPro);
        if (isPro) {
          localStorage.setItem('petory_premium', 'true');
        }
      });
    });

    // Subscribe to mock interstitial state
    const unsubInter = onInterstitialRequest(v => setMockInterstitialVisible(v));

    getProfiles().then((profiles) => {
      if (profiles && profiles.length > 0) {
        const loadedPets: Pet[] = profiles.map(profileToPet);
        setPets(loadedPets);
        // Do NOT set user here - always show first screen first
      }
      setPetsLoaded(true);
    }).catch(console.error).finally(() => {
      setPetsLoaded(true);
    });

    return () => { window.clearTimeout(adInitTimer); unsubInter(); };
  }, []);

  // ─── Reload profiles & timeline on tab/pet change ────────────────────────────
  useEffect(() => {
    if (!user || !petsLoaded) return;
    getProfiles().then(async (profiles) => {
      if (profiles && profiles.length > 0) {
        const loadedPets: Pet[] = profiles.map(profileToPet);
        setPets(loadedPets);

        const currentPet = loadedPets[selectedPetIdx];
        if (currentPet) {
          const tl = await getTimeline(currentPet.id);
          setTimeline(tl.map((t: any) => ({
            id: t.id,
            petId: t.profileId,
            type: t.type,
            time: t.time,
            date: t.date,
            note: t.note || '',
            value: t.value,
            unit: t.unit,
          })));
        }
      }
    }).catch(console.error);
  }, [activeTab, selectedPetIdx]);

  const ctx: AppContextType = {
    user,
    lang, setLang, isPremium, setIsPremium,
    activeTab, setActiveTab,
    pets, setPets, selectedPetIdx, setSelectedPetIdx,
    timeline, setTimeline,
    isAudioPlaying, setIsAudioPlaying,
    currentTrackIdx, setCurrentTrackIdx,
    showAudioModal, setShowAudioModal,
    showProfileDropdown, setShowProfileDropdown,
    showPetFormModal, setShowPetFormModal,
    showPrivacyPolicy, setShowPrivacyPolicy,
    showPremiumModal, setShowPremiumModal,
    editingPet, setEditingPet,
    audioCurrentTime, audioDuration, seekAudio,
    returnToWelcome,
  };

  if (isPrivacyRoute) {
    return (
      <AppContext.Provider value={ctx}>
        <div 
          className="w-full min-h-screen flex justify-center"
          style={{ 
            backgroundColor: '#A29E91',
            backgroundImage: 'url("/pc-bg.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: '400px'
          }}
        >
          <div
            className="w-full max-w-[480px] h-[100dvh] overflow-hidden flex flex-col relative shadow-2xl"
            style={{
              background: '#F5F3EE',
            }}
          >
            <PrivacyPolicy onClose={() => {
              window.location.href = '/';
            }} />
          </div>
        </div>
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider value={ctx}>
      <audio
        ref={audioRef}
        src={TRACKS[currentTrackIdx]?.audioUrl || '/audio/sleep1.mp3'}
        onEnded={handleAudioEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      {/* ── Outer Wrapper (PC Background) ── */}
      <div 
        className="w-full min-h-screen flex justify-center"
        style={{ 
          backgroundColor: '#A29E91',
          backgroundImage: 'url("/pc-bg.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px'
        }}
      >
        {/* ── Main App Container (Mobile Frame on PC) ── */}
        <div
          className="w-full max-w-[480px] h-[100dvh] overflow-hidden flex flex-col relative shadow-2xl"
          style={{
            background: '#F5F3EE',
          }}
        >
          {/* ── Global Safe Area Spacer removed to allow headers to extend ── */}



          <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {!user ? (
              <LoginScreen onLogin={(usr) => {
                if (usr) {
                  // Load pets before showing MainShell
                  getProfiles().then((profiles) => {
                    if (profiles && profiles.length > 0) {
                      const loadedPets: Pet[] = profiles.map((p: any) => ({
                        id: p.id,
                        name: p.name || 'My Pet',
                        breed: p.breed || '',
                        birthdate: p.birthdate || '2024-01',
                        photo: p.photo || 'https://images.unsplash.com/photo-1608262941082-65cfdb51c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
                        weight: parseFloat(p.weight) || 0,
                        weightUnit: p.weightUnit || 'kg',
                        lastVaccine: p.lastVaccine || '',
                        nextVet: p.nextVet || ''
                      }));
                      setPets(loadedPets);
                    }
                    setPetsLoaded(true);
                    setUser(usr);
                  }).catch(() => {
                    setPetsLoaded(true);
                    setUser(usr);
                  });
                }
              }} />
            ) : (
              <MainShell />
            )}
            {/* Modals available everywhere */}
            <AnimatePresence>{showAudioModal && <AudioPlayerModal />}</AnimatePresence>
            <AnimatePresence>{showPetFormModal && <PetFormModal />}</AnimatePresence>
            <AnimatePresence>{showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}</AnimatePresence>
            <AnimatePresence>{showPremiumModal && <PremiumModal />}</AnimatePresence>
            {/* Mock interstitial overlay (web) */}
            <AnimatePresence>
              {mockInterstitialVisible && <MockInterstitialAd visible={mockInterstitialVisible} />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppContext.Provider>
  );
}
