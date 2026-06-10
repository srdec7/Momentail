import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { MainShell } from './components/MainShell';
import { getProfiles, getTimeline } from '../lib/api';
import { TRACKS, AudioPlayerModal } from './components/AudioPlayerModal';
import { PremiumModal } from './components/PremiumModal';
import { PetFormModal } from './components/PetFormModal';
import { PrivacyPolicy } from './components/PrivacyPolicy';
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
  showPrivacyPolicy: boolean;
  setShowPrivacyPolicy: (v: boolean) => void;
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
  const [petsLoaded, setPetsLoaded] = useState(false);
  const [lang, setLang] = useState<Lang>('EN');
  const [isPremium, setIsPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetIdx, setSelectedPetIdx] = useState(0);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showPetFormModal, setShowPetFormModal] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
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
      localStorage.setItem('petory_premium', 'true');
      window.history.replaceState({}, document.title, window.location.pathname);
      alert(lang === 'KO' ? '프리미엄 결제가 완료되었습니다! 🎉' : 'Family Pack Unlocked! 🎉');
    }
  }, [lang]);

  // ─── Local-First Initialization ──────────────────────────────────────────────────
  // On mount: preload pets into state so LoginScreen can detect returning users.
  // Always show LoginScreen first - user must tap to enter.
  useEffect(() => {
    const premiumStatus = localStorage.getItem('petory_premium') === 'true';
    setIsPremium(premiumStatus);

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
        setPetsLoaded(true);
        // Do NOT set user here - always show first screen first
      }
    }).catch(console.error);
  }, []);

  // ─── Reload profiles & timeline on tab/pet change ────────────────────────────
  useEffect(() => {
    if (!user || !petsLoaded) return;
    getProfiles().then(async (profiles) => {
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
    showPremiumModal, setShowPremiumModal,
    showProfileDropdown, setShowProfileDropdown,
    showPetFormModal, setShowPetFormModal,
    showPrivacyPolicy, setShowPrivacyPolicy,
    editingPet, setEditingPet,
    audioCurrentTime, audioDuration, seekAudio,
  };

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
          <AnimatePresence>{showPremiumModal && <PremiumModal />}</AnimatePresence>
          <AnimatePresence>{showPetFormModal && <PetFormModal />}</AnimatePresence>
          <AnimatePresence>{showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}</AnimatePresence>
        </div>
      </div>
    </AppContext.Provider>
  );
}
