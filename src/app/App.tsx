import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { MainShell } from './components/MainShell';
import { supabase } from '../lib/supabase';
import { getProfiles, getTimeline } from '../lib/api';
import { TRACKS, AudioPlayerModal } from './components/AudioPlayerModal';
import { PremiumModal } from './components/PremiumModal';
import { PetFormModal } from './components/PetFormModal';
import { AnimatePresence } from 'motion/react';

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
  showPremiumModal: boolean;
  setShowPremiumModal: (v: boolean) => void;
  showProfileDropdown: boolean;
  setShowProfileDropdown: (v: boolean) => void;
  showPetFormModal: boolean;
  setShowPetFormModal: (v: boolean) => void;
  editingPet: Pet | null;
  setEditingPet: (p: Pet | null) => void;
  audioCurrentTime: number;
  audioDuration: number;
  seekAudio: (time: number) => void;
}

export const AppContext = createContext<AppContextType>(null!);
export const useApp = () => useContext(AppContext);

// ─── App Component ────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [lang, setLang] = useState<Lang>('EN');
  const [isPremium, setIsPremium] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [pets, setPets] = useState<Pet[]>([{
    id: 'default', name: 'My Pet', breed: '', birthdate: '2024-01', photo: 'https://images.unsplash.com/photo-1608262941082-65cfdb51c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', weight: 5, weightUnit: 'kg', lastVaccine: '', nextVet: ''
  }]);
  const [selectedPetIdx, setSelectedPetIdx] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPetFormModal, setShowPetFormModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
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

  // Check ?premium=success
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('premium') === 'success') {
      setIsPremium(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      alert(lang === 'KO' ? '프리미엄 결제가 완료되었습니다! 🎉' : 'Family Pack Unlocked! 🎉');
    }
  }, [lang]);

  // Auth State
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Only set user from session if no manual login has happened yet
      setUser((prev: any) => prev ?? (session?.user || null));
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only override user state if it was set by Supabase (not by manual master-key or onLogin)
      setUser((prev: any) => {
        // If prev is a manually-set user (e.g. master key with id:null), keep it
        if (prev && prev.id === null) return prev;
        return session?.user || null;
      });
    });
    return () => subscription.unsubscribe();
  }, []);


  // Premium Status
  useEffect(() => {
    setIsPremium(true);
  }, [user]);

  // Load Profiles & Timeline
  useEffect(() => {
    if (user) {
      getProfiles().then(async (data) => {
        if (data && data.length > 0) {
          const loadedPets = [];
          for (const p of data) {
            const detail = await fetch(`/api/profile?profileId=${p.id}`).then(r => r.json());
            loadedPets.push({
              id: detail.id,
              name: detail.name || p.name || 'My Pet',
              breed: detail.breed || '',
              birthdate: detail.birthDate || '2024-01',
              photo: detail.photo || 'https://images.unsplash.com/photo-1608262941082-65cfdb51c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
              weight: parseFloat(detail.weight) || 0,
              weightUnit: detail.weightUnit || 'kg',
              lastVaccine: detail.vaccines || '',
              nextVet: detail.nextVet || ''
            });
          }
          setPets(loadedPets);
          
          if (loadedPets.length > 0) {
             const tl = await getTimeline(loadedPets[selectedPetIdx]?.id || 'default');
             // map backend timeline to frontend timeline structure
             const mappedTl = tl.map((t: any) => {
                const date = t.time.split('T')[0] || t.created_at.split('T')[0]; // simple parsing
                const time = t.time.includes('T') ? t.time.split('T')[1].substring(0,5) : t.time;
                return {
                  id: t.id,
                  petId: t.profile_id,
                  type: t.type,
                  time: time,
                  date: date,
                  note: t.description
                }
             });
             setTimeline(mappedTl);
          }
        } else {
          // fallback if no profiles
          setPets([{
            id: 'default', name: 'My Pet', breed: '', birthdate: '2024-01', photo: 'https://images.unsplash.com/photo-1608262941082-65cfdb51c571?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400', weight: 5, weightUnit: 'kg', lastVaccine: '', nextVet: ''
          }]);
        }
      }).catch(console.error);
    }
  }, [user, activeTab, selectedPetIdx]);

  const ctx: AppContextType = {
    user,
    lang, setLang, isPremium, setIsPremium,
    activeTab, setActiveTab,
    pets, setPets, selectedPetIdx, setSelectedPetIdx,
    timeline, setTimeline,
    isAudioPlaying, setIsAudioPlaying,
    currentTrackIdx, setCurrentTrackIdx,
    showAudioModal, setShowAudioModal,
    showPremiumModal, setShowPremiumModal,
    showProfileDropdown, setShowProfileDropdown,
    showPetFormModal, setShowPetFormModal,
    editingPet, setEditingPet,
    audioCurrentTime, audioDuration, seekAudio,
  };

  if (!authChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-[#DCD7C9] text-base font-medium">Loading...</div>;
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
          {!user ? (
            <LoginScreen onLogin={(usr) => { if(usr) setUser(usr) }} />
          ) : (
            <MainShell />
          )}
          {/* Modals available everywhere */}
          <AnimatePresence>{showAudioModal && <AudioPlayerModal />}</AnimatePresence>
          <AnimatePresence>{showPremiumModal && <PremiumModal />}</AnimatePresence>
          <AnimatePresence>{showPetFormModal && <PetFormModal />}</AnimatePresence>
        </div>
      </div>
    </AppContext.Provider>
  );
}
