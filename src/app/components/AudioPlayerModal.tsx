import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, X, Lock, Moon, Wind, Target, Heart, Sun } from 'lucide-react';
import { useApp } from '../App';

// ─── Track Data ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'sleep',   labelKO: '수면 유도',   labelEN: 'Sleep',     icon: Moon },
  { id: 'anxiety', labelKO: '불안 완화',   labelEN: 'Anxiety',   icon: Wind },
  { id: 'focus',   labelKO: '집중 학습',   labelEN: 'Focus',     icon: Target },
  { id: 'healing', labelKO: '힐링 회복',   labelEN: 'Healing',   icon: Heart },
  { id: 'daily',   labelKO: '일상 루틴',   labelEN: 'Daily',     icon: Sun },
] as const;

type CatId = typeof CATEGORIES[number]['id'];

interface Track {
  id: number;
  category: CatId;
  titleKO: string;
  titleEN: string;
  duration: string;
  free: boolean;
  color: string;
  audioUrl: string;
}

export const TRACKS: Track[] = [
  // Sleep (6 tracks)
  { id: 1,  category: 'sleep',   titleKO: '자장가 빗소리',     titleEN: 'Lullaby Rain',          duration: '2:29', free: true,  color: '#9B7BC8', audioUrl: '/audio/sleep1.mp3' },
  { id: 2,  category: 'sleep',   titleKO: '은은한 파도',       titleEN: 'Gentle Waves',          duration: '2:37', free: true, color: '#9B7BC8', audioUrl: '/audio/sleep2.mp3' },
  { id: 3,  category: 'sleep',   titleKO: '딥 슬립 화이트 노이즈', titleEN: 'Deep Sleep White Noise', duration: '2:34', free: true, color: '#9B7BC8', audioUrl: '/audio/sleep3.mp3' },
  { id: 4,  category: 'sleep',   titleKO: '포근한 밤의 소리',   titleEN: 'Cozy Night Sounds',     duration: '3:31', free: true, color: '#9B7BC8', audioUrl: '/audio/sleep4.mp3' },
  { id: 5,  category: 'sleep',   titleKO: '평온한 산장',       titleEN: 'Calm Mountain Cabin',   duration: '1:48', free: true, color: '#9B7BC8', audioUrl: '/audio/sleep5.mp3' },
  { id: 6,  category: 'sleep',   titleKO: '깊은 꿈나라 여행',   titleEN: 'Deep Dream Journey',    duration: '3:04', free: true, color: '#9B7BC8', audioUrl: '/audio/sleep6.mp3' },

  // Anxiety (6 tracks)
  { id: 7,  category: 'anxiety', titleKO: '숲속 새소리',       titleEN: 'Forest Birds',          duration: '1:18', free: true,  color: '#5BAD6F', audioUrl: '/audio/Anxiety1.mp3' },
  { id: 8,  category: 'anxiety', titleKO: '냇물 흐르는 소리',  titleEN: 'Flowing Creek',         duration: '2:38', free: true, color: '#5BAD6F', audioUrl: '/audio/Anxiety2.mp3' },
  { id: 9,  category: 'anxiety', titleKO: '캠프파이어',        titleEN: 'Campfire Crackle',      duration: '1:03', free: true, color: '#5BAD6F', audioUrl: '/audio/Anxiety3.mp3' },
  { id: 10, category: 'anxiety', titleKO: '안정의 빗소리',     titleEN: 'Soothing Rain',         duration: '2:11', free: true, color: '#5BAD6F', audioUrl: '/audio/Anxiety4.mp3' },
  { id: 11, category: 'anxiety', titleKO: '젠 가든 명상',     titleEN: 'Zen Garden Meditation', duration: '3:39', free: true, color: '#5BAD6F', audioUrl: '/audio/Anxiety5.mp3' },
  { id: 12, category: 'anxiety', titleKO: '평화로운 마음',     titleEN: 'Peaceful Mind',         duration: '3:09', free: true, color: '#5BAD6F', audioUrl: '/audio/Anxiety6.mp3' },

  // Focus (6 tracks)
  { id: 13, category: 'focus',   titleKO: '바이노럴 비트 알파', titleEN: 'Alpha Binaural Beat',   duration: '1:54', free: true,  color: '#7CB9E8', audioUrl: '/audio/focus1.mp3' },
  { id: 14, category: 'focus',   titleKO: '로우 파이 드론',    titleEN: 'Lo-Fi Drone',           duration: '1:42', free: true, color: '#7CB9E8', audioUrl: '/audio/focus2.mp3' },
  { id: 15, category: 'focus',   titleKO: '집중 피아노',       titleEN: 'Focus Piano',           duration: '2:40', free: true, color: '#7CB9E8', audioUrl: '/audio/focus3.mp3' },
  { id: 16, category: 'focus',   titleKO: '화이트 노이즈 학습', titleEN: 'Study White Noise',     duration: '1:14', free: true, color: '#7CB9E8', audioUrl: '/audio/focus4.mp3' },
  { id: 17, category: 'focus',   titleKO: '도서관 앰비언스',   titleEN: 'Library Ambience',      duration: '1:40', free: true, color: '#7CB9E8', audioUrl: '/audio/focus5.mp3' },
  { id: 18, category: 'focus',   titleKO: '딥 워크 비트',      titleEN: 'Deep Work Beats',       duration: '2:07', free: true, color: '#7CB9E8', audioUrl: '/audio/focus6.mp3' },

  // Healing (6 tracks)
  { id: 19, category: 'healing', titleKO: '봄 햇살 멜로디',   titleEN: 'Spring Sunshine',       duration: '4:03', free: true,  color: '#E88B5B', audioUrl: '/audio/healing1.mp3' },
  { id: 20, category: 'healing', titleKO: '힐링 보울',        titleEN: 'Healing Bowls',         duration: '3:33', free: true, color: '#E88B5B', audioUrl: '/audio/healing2.mp3' },
  { id: 21, category: 'healing', titleKO: '모닥불 재즈',      titleEN: 'Fireside Jazz',         duration: '3:51', free: true, color: '#E88B5B', audioUrl: '/audio/healing3.mp3' },
  { id: 22, category: 'healing', titleKO: '자연의 숨결',       titleEN: 'Nature\'s Breath',      duration: '3:32', free: true, color: '#E88B5B', audioUrl: '/audio/healing4.mp3' },
  { id: 23, category: 'healing', titleKO: '명상 첼로',        titleEN: 'Meditation Cello',      duration: '2:29', free: true, color: '#E88B5B', audioUrl: '/audio/healing5.mp3' },
  { id: 24, category: 'healing', titleKO: '평온한 하프',       titleEN: 'Serene Harp',           duration: '3:42', free: true, color: '#E88B5B', audioUrl: '/audio/healing6.mp3' },

  // Daily (6 tracks)
  { id: 25, category: 'daily',   titleKO: '아침 스트레칭',    titleEN: 'Morning Stretch',       duration: '1:01', free: true,  color: '#C4A875', audioUrl: '/audio/daily1.mp3' },
  { id: 26, category: 'daily',   titleKO: '저녁 산책 비트',   titleEN: 'Evening Walk',          duration: '2:12', free: true, color: '#C4A875', audioUrl: '/audio/daily2.mp3' },
  { id: 27, category: 'daily',   titleKO: '취침 루틴',        titleEN: 'Bedtime Routine',       duration: '0:24', free: true, color: '#C4A875', audioUrl: '/audio/daily3.mp3' },
  { id: 28, category: 'daily',   titleKO: '오후의 휴식',       titleEN: 'Afternoon Break',       duration: '2:02', free: true, color: '#C4A875', audioUrl: '/audio/daily4.mp3' },
  { id: 29, category: 'daily',   titleKO: '즐거운 놀이 시간',  titleEN: 'Playful Time',          duration: '1:37', free: true, color: '#C4A875', audioUrl: '/audio/daily5.mp3' },
  { id: 30, category: 'daily',   titleKO: '차분한 마무리',     titleEN: 'Calm Wrap-up',          duration: '0:27', free: true, color: '#C4A875', audioUrl: '/audio/daily6.mp3' },
];

// ─── LP Disc ──────────────────────────────────────────────────────────────────
function LpDisc({ playing, color }: { playing: boolean; color: string }) {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div
        className={`w-full h-full rounded-full ${playing ? 'lp-spin' : 'lp-spin-paused'}`}
        style={{
          background: `conic-gradient(from 0deg, ${color}cc, ${color}44, ${color}cc, ${color}22, ${color}cc)`,
          boxShadow: `0 8px 30px ${color}55`,
        }}
      >
        {/* Groove rings */}
        {[86, 72, 58, 44].map(s => (
          <div
            key={s}
            className="absolute rounded-full border"
            style={{
              width: s, height: s,
              top: (112 - s) / 2, left: (112 - s) / 2,
              borderColor: 'rgba(0,0,0,0.2)',
            }}
          />
        ))}
        {/* Center hole */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
          style={{ background: '#EAE6DC', border: '2px solid rgba(0,0,0,0.15)' }}
        />
      </div>
      {/* Needle */}
      <div
        className="absolute -right-1 top-4 w-0.5 h-8 origin-top rounded-full"
        style={{
          background: 'linear-gradient(to bottom, #888, #555)',
          transform: 'rotate(25deg)',
        }}
      />
    </div>
  );
}

// ─── Audio Player Modal ────────────────────────────────────────────────────────
export function AudioPlayerModal() {
  const { lang, isAudioPlaying, setIsAudioPlaying, currentTrackIdx, setCurrentTrackIdx, setShowAudioModal, isPremium, setShowPremiumModal, audioCurrentTime, audioDuration, seekAudio } = useApp();
  const KO = lang === 'KO';
  const [selectedCat, setSelectedCat] = useState<CatId>('sleep');

  const progress = audioDuration > 0 ? (audioCurrentTime / audioDuration) * 100 : 0;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedProgress = x / rect.width;
    seekAudio(clickedProgress * audioDuration);
  };

  const track = TRACKS[currentTrackIdx];
  const catTracks = TRACKS.filter(t => t.category === selectedCat);

  const handleTrackClick = (t: Track) => {
    setCurrentTrackIdx(TRACKS.indexOf(t));
    setIsAudioPlaying(true);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIdx - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIdx(prevIdx);
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIdx + 1) % TRACKS.length;
    setCurrentTrackIdx(nextIdx);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={() => setShowAudioModal(false)}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 400 }}
        className="rounded-t-3xl overflow-hidden"
        style={{ background: '#1e2a2c', maxHeight: '82%' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4">
          <p className="text-sm font-semibold tracking-wider uppercase" style={{ color: 'rgba(220,215,201,0.5)' }}>
            {KO ? '테라피 오디오' : 'Therapy Audio'}
          </p>
          <button onClick={() => setShowAudioModal(false)} style={{ color: 'rgba(220,215,201,0.4)' }}>
            <X size={18} />
          </button>
        </div>

        {/* LP + Track Info */}
        <div className="px-5 pb-5">
          <LpDisc playing={isAudioPlaying} color={track.color} />

          <div className="text-center mt-5 mb-4">
            <p
              className="text-lg font-bold mb-1"
              style={{ color: '#DCD7C9' }}
            >
              {KO ? track.titleKO : track.titleEN}
            </p>
            <p className="text-[12px]" style={{ color: 'rgba(220,215,201,0.4)' }}>
              {CATEGORIES.find(c => c.id === track.category)?.[KO ? 'labelKO' : 'labelEN']}
              {' · '}{track.duration}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div
              className="h-1 rounded-full mb-1 overflow-hidden cursor-pointer relative"
              style={{ background: 'rgba(255,255,255,0.1)' }}
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${track.color}, ${track.color}99)` }}
              />
            </div>
            <div className="flex justify-between text-[11px]" style={{ color: 'rgba(220,215,201,0.3)' }}>
              <span>{formatTime(audioCurrentTime)}</span><span>{track.duration}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8">
            <button onClick={handlePrev} style={{ color: 'rgba(220,215,201,0.6)' }}>
              <SkipBack size={22} />
            </button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${track.color}, ${track.color}99)`,
                boxShadow: `0 4px 20px ${track.color}60`,
              }}
            >
              {isAudioPlaying
                ? <Pause size={22} style={{ color: '#fff' }} />
                : <Play size={22} style={{ color: '#fff', marginLeft: 2 }} />}
            </motion.button>
            <button onClick={handleNext} style={{ color: 'rgba(220,215,201,0.6)' }}>
              <SkipForward size={22} />
            </button>
          </div>
        </div>

        {/* Category tabs + Track list */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', maxHeight: 280, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Category tabs */}
          <div className="flex gap-2 px-4 py-3 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className="flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-medium transition-all"
                style={
                  selectedCat === cat.id
                    ? { background: 'rgba(255,255,255,0.12)', color: '#DCD7C9' }
                    : { background: 'transparent', color: 'rgba(220,215,201,0.4)' }
                }
              >
                <cat.icon size={14} strokeWidth={2.5} />
                {KO ? cat.labelKO : cat.labelEN}
              </button>
            ))}
          </div>

          {/* Track list */}
          <div className="overflow-y-auto petory-scroll flex-1 pb-8">
            {catTracks.map(t => {
              const isCurrent = t.id === track.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTrackClick(t)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left transition-all"
                  style={{ background: isCurrent ? 'rgba(255,255,255,0.07)' : 'transparent' }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${t.color}22` }}
                  >
                    {isCurrent && isAudioPlaying
                      ? (
                        <div className="flex gap-0.5 items-end h-4">
                          {[1,2,3].map(i => (
                            <span key={i} className={`block rounded-full music-bar-${i}`} style={{ width: 2, height: '100%', background: t.color, transformOrigin: 'bottom' }} />
                          ))}
                        </div>
                      )
                      : <span style={{ fontSize: 14 }}>♪</span>
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: isCurrent ? t.color : 'rgba(220,215,201,0.8)' }}>
                      {KO ? t.titleKO : t.titleEN}
                    </p>
                    <p className="text-[11px]" style={{ color: 'rgba(220,215,201,0.25)' }}>{t.duration}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
